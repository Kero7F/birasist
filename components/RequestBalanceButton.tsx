"use client";

import { FormEvent, useState } from "react";
import { PlusCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RequestBalanceButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    alert("Talebiniz alınmıştır");
    setOpen(false);
    setAmount("");
    setBank("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="inline-flex items-center gap-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          Talep Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card text-card-foreground border border-border">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-md font-semibold">
              Talep Tutar Formu
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Çekmek istediğiniz komisyon tutarını giriniz. En az ₺1.000,00 tutarında
          talep oluşturulabilir.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank">IBAN Seçimi</Label>
            <Select value={bank} onValueChange={(value) => setBank(value)} required>
              <SelectTrigger id="bank" className="w-full">
                <SelectValue placeholder="IBAN seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iban-1">Kayıtlı IBAN - 1</SelectItem>
                <SelectItem value="iban-2">Kayıtlı IBAN - 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Talep Tutarınız</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                ₺
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="Örn: 1000"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" />
            Komisyon Çek
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

