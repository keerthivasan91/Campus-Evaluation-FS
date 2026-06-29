import axios from "axios";

const token = import.meta.env?.VITE_NOTIFICATION_API_TOKEN ?? "";

export async function authenticate() {
    // Call auth API
    // Save token
}

export async function Log(stack, level, packageName, message) {
    await axios.post(
        "http://4.224.186.213/evaluation-service/logs",
        {
            stack,
            level,
            package: packageName,
            message
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}