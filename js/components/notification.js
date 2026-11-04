
/* *********************************************************
   AEGON — Notification Component
   File: js/components/notification.js

   Responsibilities:
   * Show success, error, warning, and info messages
   * Remove notifications automatically
   * Allow users to dismiss notifications
  ********************************************************** */

let notificationContainer = null;
let notificationId = 0;

function getNotificationContainer() {
  if (notificationContainer?.isConnected) {
    return notificationContainer;
  }

  notificationContainer = document.createElement("div");
  notificationContainer.className = "notification-container";
  notificationContainer.setAttribute("aria-label", "Notifications");

  Object.assign(notificationContainer.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "min(360px, calc(100vw - 40px))",
  });

  document.body.appendChild(notificationContainer);

  return notificationContainer;
}

export function showNotification(
  message,
  type = "info",
  duration = 3000
) {
  const allowedTypes = ["success", "error", "warning", "info"];

  if (!allowedTypes.includes(type)) {
    type = "info";
  }

  const container = getNotificationContainer();
  const notification = document.createElement("div");
  const id = ++notificationId;

  notification.className = `notification notification--${type}`;
  notification.dataset.notificationId = String(id);

  Object.assign(notification.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "#1c2925",
    color: "#ffffff",
    borderLeft: `4px solid ${
      type === "success"
        ? "#20c997"
        : type === "error"
          ? "#ff6b6b"
          : type === "warning"
            ? "#ffc107"
            : "#6ea8fe"
    }`,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: "1.5",
  });

  // Use textContent instead of innerHTML for untrusted messages.
  const messageText = document.createElement("span");
  messageText.textContent = String(message ?? "");
  messageText.style.overflowWrap = "anywhere";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Dismiss notification");

  Object.assign(closeButton.style, {
    border: "none",
    background: "transparent",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "22px",
    lineHeight: "1",
    padding: "0 4px",
    flexShrink: "0",
  });

  let timeoutId;

  function dismiss() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    notification.remove();
  }

  closeButton.addEventListener("click", dismiss);

  notification.append(messageText, closeButton);

  if (type === "error") {
    notification.setAttribute("role", "alert");
  } else {
    notification.setAttribute("role", "status");
  }

  container.appendChild(notification);

  const safeDuration = Number(duration);

  if (Number.isFinite(safeDuration) && safeDuration > 0) {
    timeoutId = setTimeout(dismiss, safeDuration);
  }

  return {
    id,
    dismiss,
  };
}
