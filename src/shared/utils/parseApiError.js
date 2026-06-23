/**
 * parseApiError — extracts a human-readable message from an Axios error.
 *
 * Handles:
 *   1. Structured error arrays  → errors[0].message
 *   2. Command-validation shape → errors.command[0]
 *   3. Top-level message        → data.message
 *   4. ASP.NET Core validation  → Object.values(errors).flat()
 *   5. Plain string body        → data (string)
 *   6. Axios default            → error.message
 *
 * @param {import("axios").AxiosError} error
 * @returns {string} A user-facing error message.
 */
export function parseApiError(error) {
    const errData = error.response?.data;

    let msg =
        errData?.errors?.[0]?.message ||
        errData?.errors?.command?.[0] ||
        errData?.message;

    // Fallback for ASP.NET Core generic validation dictionaries
    if (
        !msg &&
        errData?.errors &&
        typeof errData.errors === "object" &&
        !Array.isArray(errData.errors)
    ) {
        const allErrors = Object.values(errData.errors).flat();
        if (allErrors.length > 0 && typeof allErrors[0] === "string") {
            msg = allErrors.join("\n");
        }
    }

    if (!msg) {
        msg = typeof errData === "string" ? errData : error.message;
    }

    return msg || "An unexpected error occurred.";
}
