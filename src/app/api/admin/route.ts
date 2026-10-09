import { supabase } from "@/lib/supabase";
import { adminAuthorized, clean, jsonError } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Collection = "donors" | "requests";
const collections: Collection[] = ["donors", "requests"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  if (!adminAuthorized(request)) return jsonError("Unauthorized.", 401);
  try {
    const [donorResult, requestResult] = await Promise.all([
      supabase.from("donors").select("id, name, blood_group, location, phone, consent, available_for_contact, status, created_at, updated_at").order("created_at", { ascending: false }).limit(300),
      supabase.from("requests").select("id, patient_label, blood_group, hospital, location, phone, urgency, units, consent, status, request_status, created_at, updated_at").order("created_at", { ascending: false }).limit(300),
    ]);
    if (donorResult.error || requestResult.error) {
      console.error("Supabase admin query error:", donorResult.error?.message, requestResult.error?.message);
      return jsonError("Could not load admin data.", 500);
    }
    const donors = (donorResult.data ?? []).map(d => ({
      id: d.id, name: d.name, bloodGroup: d.blood_group, location: d.location,
      phone: d.phone, consent: d.consent, availableForContact: d.available_for_contact,
      status: d.status, createdAt: d.created_at, updatedAt: d.updated_at,
    }));
    const requests = (requestResult.data ?? []).map(r => ({
      id: r.id, patientLabel: r.patient_label, bloodGroup: r.blood_group,
      hospital: r.hospital, location: r.location, phone: r.phone,
      urgency: r.urgency, units: r.units, consent: r.consent,
      status: r.status, requestStatus: r.request_status,
      createdAt: r.created_at, updatedAt: r.updated_at,
    }));
    return Response.json({ donors, requests }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Could not load admin data.", 500);
  }
}

export async function PATCH(request: Request) {
  if (!adminAuthorized(request)) return jsonError("Unauthorized.", 401);
  try {
    const b = await request.json();
    const collection = collections.includes(b.collection) ? b.collection as Collection : null;
    const id = clean(b.id, 36);
    if (!collection || !uuidPattern.test(id)) return jsonError("Invalid admin action.");

    if (collection === "donors") {
      const allowed = ["pending", "verified", "rejected", "hidden"];
      if (!allowed.includes(b.status)) return jsonError("Invalid donor status.");
      const { error } = await supabase.from("donors")
        .update({ status: b.status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) {
        console.error("Supabase donor update error:", error.message);
        return jsonError("Could not update record.", 500);
      }
    } else {
      const allowed = ["pending", "approved", "rejected"];
      const update: { status: string; request_status?: string; updated_at: string } = {
        status: b.status, updated_at: new Date().toISOString(),
      };
      if (!allowed.includes(b.status)) return jsonError("Invalid request status.");
      if (b.requestStatus !== undefined) {
        if (!["open", "fulfilled", "closed"].includes(b.requestStatus)) return jsonError("Invalid request state.");
        update.request_status = b.requestStatus;
      }
      const { error } = await supabase.from("requests").update(update).eq("id", id);
      if (error) {
        console.error("Supabase request update error:", error.message);
        return jsonError("Could not update record.", 500);
      }
    }
    return Response.json({ message: "Updated." });
  } catch {
    return jsonError("Could not update record.", 500);
  }
}

export async function DELETE(request: Request) {
  if (!adminAuthorized(request)) return jsonError("Unauthorized.", 401);
  try {
    const b = await request.json();
    const collection = collections.includes(b.collection) ? b.collection as Collection : null;
    const id = clean(b.id, 36);
    if (!collection || !uuidPattern.test(id)) return jsonError("Invalid delete request.");

    const { error } = await supabase.from(collection).delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error.message);
      return jsonError("Could not delete record.", 500);
    }
    return Response.json({ message: "Deleted." });
  } catch {
    return jsonError("Could not delete record.", 500);
  }
}
