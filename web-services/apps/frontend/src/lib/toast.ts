import { toast } from "sonner";

export function showError(message: string, description?: string) {
  toast.error(message, {
    position: "bottom-right",
    description,
  });
}

export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    position: "bottom-right",
    description,
  });
}

export function showInfo(message: string, description?: string) {
  toast.info(message, {
    position: "bottom-right",
    description,
  });
}

export function showLoading(message: string) {
  return toast.loading(message, { position: "bottom-right" });
}

export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}
