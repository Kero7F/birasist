import { Font } from "@react-pdf/renderer";

let robotoRegistered = false;

/** Tek seferlik kayıt — ContractTemplate / ReceiptTemplate paylaşır. */
export function ensureRobotoFonts(): void {
  if (robotoRegistered) return;
  robotoRegistered = true;
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf",
        fontWeight: 400,
      },
      {
        src: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammT.ttf",
        fontWeight: 700,
      },
    ],
  });
}

ensureRobotoFonts();
