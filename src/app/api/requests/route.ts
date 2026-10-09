import { supabase } from "@/lib/supabase";
import { clean, jsonError, URGENCIES, validBloodGroup, validPhone } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("requests")
      .select("id, patient_label, blood_group, hospital, location, units, urgency, phone, created_at")
      .eq("status", "approved")
      .eq("request_status", "open")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase public request query error:", error.message);
      return jsonError("Could not load requests.", 500);
    }

    return Response.json({ requests: (data ?? []).map(r => ({
      id: r.id,
      patientLabel: r.patient_label,
      bloodGroup: r.blood_group,
      hospital: r.hospital,
      location: r.location,
      units: r.units,
      urgency: r.urgency,
      phone: r.phone,
      createdAt: r.created_at,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Could not load requests.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const b = await request.json();
    const patientLabel = clean(b.patientLabel || "Patient", 60) || "Patient";
    const bloodGroup = clean(b.bloodGroup, 5);
    const hospital = clean(b.hospital, 120);
    const location = clean(b.location, 80);
    const phone = clean(b.phone, 20).replace(/\s+/g, "");
    const urgency = clean(b.urgency, 20);
    const units = Number(b.units);

    if (!validBloodGroup(bloodGroup) || hospital.length < 2 || location.length < 2 || !validPhone(phone) ||
        !(URGENCIES as readonly string[]).includes(urgency) || !Number.isInteger(units) || units < 1 || units > 10 ||
        b.consent !== true) {
      return jsonError("Please complete all required fields and confirm consent.");
    }

const { error } = await supabase.from("requests").insert({
  requester_name: patientLabel,
  patient_label: patientLabel,
  blood_group: bloodGroup,
  hospital,
  location,
  area: location,
  contact_phone: phone,
  phone,
  urgency,
  units,
  consent: true,
  status: "pending",
  request_status: "open",
});
    if (error) {
      console.error("Supabase request insert error:", error.message);
      return jsonError("Could not submit request. Please try again later.", 500);
    }

    return Response.json({ message: "Request submitted for review. It will be published after admin approval." }, { status: 201 });
  } catch {
    return jsonError("Could not submit request. Please try again later.", 500);
  }
}
