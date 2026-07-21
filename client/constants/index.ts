export const COLORS = {
    primary: "#111111",
    secondary: "#666666",
    background: "#FFFFFF",
    surface: "#F7F7F7",
    accent: "#FF4C3B",
    border: "#EEEEEE",
    error: "#FF4444",
};

export const CATEGORIES = [
    { id: 1, name: "Men", icon: "man-outline" },
    { id: 2, name: "Women", icon: "woman-outline" },
    { id: 3, name: "Kids", icon: "happy-outline" },
    { id: 4, name: "Shoes", icon: "footsteps-outline" },
    { id: 5, name: "Bag", icon: "briefcase-outline" },
    { id: 6, name: "Other", icon: "grid-outline" },
];

export const PROFILE_MENU = [
    { id: 1, title: "My Orders", icon: "receipt-outline", route: "/orders" },
    { id: 2, title: "Shipping Addresses", icon: "location-outline", route: "/addresses" },
    { id: 4, title: "My Reviews", icon: "star-outline", route: "/reviews" },
    { id: 5, title: "Settings", icon: "settings-outline", route: "/settings" },
];

export const getStatusColor = (status: string) => {
    switch (status) {
        case "placed":
            return { bg: "bg-yellow-50 dark:bg-yellow-900/30", text: "text-yellow-900 dark:text-yellow-400" };
        case "processing":
            return { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-300" };
        case "shipped":
            return { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-900 dark:text-purple-400" };
        case "delivered":
            return { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-900 dark:text-green-400" };
        case "cancelled":
            return { bg: "bg-red-500 dark:bg-red-600", text: "text-white dark:text-white" };
        default:
            return { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-900 dark:text-gray-300" };
    }
};
