"use client";

import * as Popover from "@radix-ui/react-popover";
import { RiErrorWarningFill } from "@remixicon/react";
import { toast } from "sonner";
import { useRecaptchaV2 } from "@/hooks/use-recaptcha-v2";
import { Alert, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface RecaptchaPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (token: string) => void;
  trigger: React.ReactNode;
  verifyButtonText?: string;
}

export function RecaptchaPopover({
  open,
  onOpenChange,
  onVerify,
  trigger,
  verifyButtonText = "Verify & Submit",
}: RecaptchaPopoverProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const initializedRef = useRef(false);

  const { containerRef, getToken, resetCaptcha, initializeRecaptcha } =
    useRecaptchaV2(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "");

  // Efeito para gerenciar o reCAPTCHA quando o popover abrir/fechar
  useEffect(() => {
    if (open) {
      // Delay para garantir que o DOM esteja pronto
      const timer = setTimeout(async () => {
        try {
          await initializeRecaptcha();
          initializedRef.current = true;
        } catch (error) {
          console.error("Failed to initialize reCAPTCHA:", error);
          toast.custom(
            () => (
              <Alert variant="mono" icon="destructive">
                <AlertIcon>
                  <RiErrorWarningFill />
                </AlertIcon>
                <AlertTitle>
                  Failed to load reCAPTCHA. Please try again.
                </AlertTitle>
              </Alert>
            ),
            { position: "top-center" }
          );
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // Reset quando fechar
      resetCaptcha();
      initializedRef.current = false;
      setIsVerifying(false);
    }
  }, [open, initializeRecaptcha, resetCaptcha]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsVerifying(false);
    }
    onOpenChange(newOpen);
  };

  const handleVerify = async () => {
    if (isVerifying) return;

    setIsVerifying(true);

    try {
      // Pequeno delay para garantir que o reCAPTCHA está pronto
      await new Promise((resolve) => setTimeout(resolve, 200));

      const token = getToken();

      if (!token) {
        toast.custom(
          () => (
            <Alert variant="mono" icon="destructive">
              <AlertIcon>
                <RiErrorWarningFill />
              </AlertIcon>
              <AlertTitle>
                Please complete the reCAPTCHA verification.
              </AlertTitle>
            </Alert>
          ),
          {
            position: "top-center",
          }
        );
        setIsVerifying(false);
        return;
      }

      // Chama a função de verificação passada via props
      await onVerify(token);

      // Fecha o popover após verificação bem-sucedida
      onOpenChange(false);
    } catch (error) {
      console.error("Error getting reCAPTCHA token:", error);
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive">
            <AlertIcon>
              <RiErrorWarningFill />
            </AlertIcon>
            <AlertTitle>
              {error instanceof Error
                ? error.message
                : "Verification failed. Please try again."}
            </AlertTitle>
          </Alert>
        ),
        {
          position: "top-center",
        }
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white p-4 rounded-lg shadow-lg z-50 min-w-[300px] border border-gray-200"
          sideOffset={5}
          align="end"
          onInteractOutside={(e) => {
            // Prevent closing when interacting with reCAPTCHA iframe
            const target = e.target as HTMLElement;
            if (target.tagName === "IFRAME" || target.closest("iframe")) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (isVerifying) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600">
              Please complete the reCAPTCHA verification to continue.
            </div>

            <div
              ref={containerRef}
              className="min-h-[78px] flex items-center justify-center bg-gray-50 rounded border"
              key={open ? "recaptcha-open" : "recaptcha-closed"} // Force re-render
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isVerifying}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? "Verifying..." : verifyButtonText}
              </Button>
            </div>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
