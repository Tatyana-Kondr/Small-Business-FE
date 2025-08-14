import { toast } from "react-hot-toast";
import { MdErrorOutline, MdCheckCircle, MdInfoOutline } from "react-icons/md";
import { ReactNode } from "react";

function showCustomToast({
  title,
  message,
  icon,
  color,
  titleColor,
}: {
  title: string;
  message: string;
  icon: ReactNode;
  color: string;       // левая граница и иконка
  titleColor: string;  // заголовок
}) {
  toast.custom((t) => (
    <div
      style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "#fff",
        borderLeft: `6px solid ${color}`,
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        display: "flex",
        pointerEvents: "auto",
        padding: "16px",
        transform: t.visible ? "translateY(0)" : "translateY(20px)",
        opacity: t.visible ? 1 : 0,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div style={{ flexShrink: 0, color, fontSize: "24px", marginRight: "12px" }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: titleColor,
            fontWeight: "bold",
            fontSize: "15px",
            marginBottom: "4px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.4" }}>
          {message}
        </div>
      </div>
    </div>
  ));
}

export function showSuccessToast(title: string, message: string) {
  showCustomToast({
    title,
    message,
    icon: <MdCheckCircle />,
    color: "#22c55e", // зелёная левая граница и иконка
    titleColor: "#15803d", // насыщенный зелёный заголовок
  });
}

export function showErrorToast(title: string, message: string) {
  showCustomToast({
    title,
    message,
    icon: <MdErrorOutline />,
    color: "#ef4444", // красная левая граница и иконка
    titleColor: "#b91c1c", // красный заголовок
  });
}

export function showInfoToast(title: string, message: string) {
  showCustomToast({
    title,
    message,
    icon: <MdInfoOutline />,
    color: "#3b82f6", // синяя левая граница и иконка
    titleColor: "#1d4ed8", // синий заголовок
  });
}
