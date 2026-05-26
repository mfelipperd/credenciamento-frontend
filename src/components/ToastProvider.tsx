import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#112244",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        },
      }}
    />
  );
}
