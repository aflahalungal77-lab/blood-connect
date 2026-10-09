import { supabase } from "@/lib/supabase";
import { clean, jsonError, validBloodGroup, validPhone } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const group = clean(url.searchParams.get("bloodGroup"), 5);
    const location = clean(url.searchParams.get("location"), 80);
    if (group && !validBloodGroup(group)) return jsonError("Invalid blood group.");

    let query = supabase
      .from("donors")
      .select("id, name, blood_group, location, phone, created_at")
      .eq("status", "verified")
      .eq("available_for_contact", true)
      .order("created_at", { ascending: false })
      .limit(100);

    if (group) query = query.eq("blood_group", group);
    if (location) {
      const safeLocation = location.replace(/[\\%_]/g, "\\$&");
      query = query.ilike("location", `%${safeLocation}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase donor search error:", error.message);
      return jsonError("Could not load donors. Please try again later.", 500);
    }

    return Response.json({ donors: (data ?? []).map(d => ({
      id: d.id,
      name: d.name,
      bloodGroup: d.blood_group,
      location: d.location,
      phone: d.phone,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Could not load donors. Please try again later.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 80);
    const bloodGroup = clean(body.bloodGroup, 5);
    const location = clean(body.location, 80);
    const phone = clean(body.phone, 20).replace(/\s+/g, "");
    const consent = body.consent === true;

    if (name.length < 2 || !validBloodGroup(bloodGroup) || location.length < 2 || !validPhone(phone) || !consent) {
      return jsonError("Please provide valid details and consent to share your contact with people seeking blood.");
    }

    const { data: duplicate, error: duplicateError } = await supabase
      .from("donors")
      .select("id")
      .eq("phone", phone)
      .in("status", ["pending", "verified"])
      .limit(1)
      .maybeSingle();
    if (duplicateError) {
      console.error("Supabase duplicate check error:", duplicateError.message);
      return jsonError("Could not submit registration. Please try again later.", 500);
    }
    if (duplicate) return jsonError("This phone number is already registered or awaiting review.", 409);

    const { error } = await supabase.from("donors").insert({
      name, blood_group: bloodGroup, location, phone, consent: true,
      available_for_contact: true, status: "pending",
    });
    if (error) {
      console.error("Supabase donor insert error:", error.message);
      return jsonError("Could not submit registration. Please try again later.", 500);
    }

    return Response.json({ message: "Registration submitted. Your donor profile will appear after admin review." }, { status: 201 });
  } catch {
    return jsonError("Could not submit registration. Please try again later.", 500);
  }
}
