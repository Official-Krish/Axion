import { toast } from "sonner";

export const showError = (message: string) =>
  toast.error(message, { position: "bottom-right", duration: 6000 });

export const showSuccess = (message: string) =>
  toast.success(message, { position: "bottom-right", duration: 3000 });

export const showInfo = (message: string) =>
  toast.info(message, { position: "bottom-right", duration: 4000 });

export const showLoading = (message: string) =>
  toast.loading(message, { position: "bottom-right" });

export const dismissToast = () => toast.dismiss();

export const showPromise = <T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
) =>
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    position: "bottom-right",
  });
