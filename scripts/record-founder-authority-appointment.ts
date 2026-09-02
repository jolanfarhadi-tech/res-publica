import { createDatabase } from "../src/persistence/database";
import {
  FounderAuthorityAppointmentError,
  recordFounderAuthorityAppointment,
} from "../src/application/founder-authority";
import {
  FounderAuthorityConfigurationError,
  readFounderAuthorityAppointmentEnvironment,
} from "../src/application/founder-authority-config";

async function main() {
  const input = readFounderAuthorityAppointmentEnvironment(process.env);
  const runtime = createDatabase(input.databaseUrl);
  try {
    const grant = await recordFounderAuthorityAppointment(
      runtime.db,
      input.appointment
    );
    console.log(JSON.stringify({
      status: "foundational_authority_recorded",
      grantId: grant.id,
      authority: input.appointment.authority,
      target: input.appointment.target,
    }));
  } finally {
    await runtime.close();
  }
}

main().catch((error: unknown) => {
  const code = error instanceof FounderAuthorityAppointmentError
    ? error.code
    : error instanceof FounderAuthorityConfigurationError
      ? error.message
      : "founder_authority_recording_failed";
  console.error(code);
  process.exitCode = 1;
});
