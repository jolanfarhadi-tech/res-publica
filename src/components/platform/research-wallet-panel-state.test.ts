import { describe, expect, it } from "vitest";
import { researchWalletPanelState } from "./research-wallet-panel-state";

describe("ResearchWalletPanel activation boundary", () => {
  it("removes every mutation path when wallet approval is closed", () => {
    expect(researchWalletPanelState({
      status: "offered",
      activationAvailable: false,
      hasLocalWallet: false,
      hasActiveDevice: false,
    })).toEqual({
      canActivate: false,
      canRecover: false,
      canRevoke: false,
      canReadLocalWallet: false,
    });
  });

  it("retains only status-appropriate controls when wallet approval is open", () => {
    expect(researchWalletPanelState({
      status: "offered",
      activationAvailable: true,
      hasLocalWallet: false,
      hasActiveDevice: false,
    })).toMatchObject({ canActivate: true, canRecover: false, canRevoke: false });
    expect(researchWalletPanelState({
      status: "active",
      activationAvailable: true,
      hasLocalWallet: false,
      hasActiveDevice: true,
    })).toMatchObject({ canActivate: false, canRecover: true, canRevoke: true });
  });
});
