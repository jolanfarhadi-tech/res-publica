type ResearchWalletStatus = "offered" | "active" | "suspended" | "revoked";

export function researchWalletPanelState(input: {
  status: ResearchWalletStatus;
  activationAvailable: boolean;
  hasLocalWallet: boolean;
  hasActiveDevice: boolean;
}) {
  const canReadLocalWallet = input.activationAvailable;
  return {
    canActivate: input.activationAvailable && input.status === "offered",
    canRecover:
      input.activationAvailable &&
      input.status === "active" &&
      !input.hasLocalWallet &&
      input.hasActiveDevice,
    canRevoke: input.activationAvailable && input.status === "active",
    canReadLocalWallet,
  };
}
