export const parseValueByType = (value: string, type: string) => {
    console.log(value, type);
    try {
        // Handle array/list types first
        if (type.includes("List[") || type.includes("[]") || type.includes("vector")) {
            // If the value is already an array (from direct input), return it
            if (Array.isArray(value)) return value;

            // If it's an empty array string, return empty array
            if (value === "[]") return [];

            // Try to parse JSON array
            try {
                return JSON.parse(value);
            } catch (e) {
                // If parsing fails, return empty array
                return [];
            }
        }

        // Handle scalar types
        if (type.includes("integer") || type.includes("int")) {
            return parseInt(value, 10);
        } else if (type.includes("float") || type.includes("Float")) {
            return parseFloat(value);
        } else if (type.includes("boolean") || type.includes("bool")) {
            return value.toLowerCase() === "true";
        }
        return value; // Default to string
    } catch (error) {
        return value; // Return original value if parsing fails
    }
};

export const getDefaultValue = (type: string) => {
    switch (type) {
        case "number":
            return 0;
        case "string":
            return "";
        case "boolean":
            return false;
        case "number[]":
        case "string[]":
            return [];
        default:
            return null;
    }
};

export const getGenericType = (types: { cpp?: string; java?: string; javascript?: string; python?: string }): string => {
    // Handle undefined types object
    if (!types) return "any";

    // Map language-specific types to generic types
    if (types.javascript === "number" || types.cpp === "int") return "number";
    if (types.javascript === "string" || types.cpp === "string") return "string";
    if (types.javascript === "boolean" || types.cpp === "bool") return "boolean";
    if (types.javascript?.includes("[]") || types.cpp?.includes("vector")) return "array";
    return "any";
};

export const commonOutputTypes = [
    { value: "number", label: "integer" },
    { value: "List[float]", label: "List[float]" },
    { value: "List[integer]", label: "List[integer]" },
    { value: "string", label: "string" },
    { value: "float", label: "float" },
    { value: "boolean", label: "boolean" },
    { value: "List[string]", label: "List[string]" },
    { value: "List[boolean]", label: "List[boolean]" },
    { value: "custom", label: "Custom Type" },
]; 