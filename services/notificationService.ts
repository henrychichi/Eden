
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return;
    }
    
    if (Notification.permission === "granted") {
        return;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            new Notification("Notifications Enabled", {
                body: "You will now receive updates for matches and messages!",
            });
        }
    }
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        const notification = new Notification(title, options);
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
};
