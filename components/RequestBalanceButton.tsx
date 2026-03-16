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
          Bakiye Talep Et
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-md font-semibold">
              Bakiye Talep Formu
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Hesabınıza yüklenmesini istediğiniz tutarı giriniz. İşleminizin
          onaylanması için tutarın banka hesaplarımıza ulaşmış olması
          gerekmektedir.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank">Ödeme Yapılan Banka</Label>
            <Select
              value={bank}
              onValueChange={(value) => setBank(value)}
              required
            >
              <SelectTrigger id="bank" className="w-full">
                <SelectValue placeholder="Banka seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ziraat">Ziraat Bankası</SelectItem>
                <SelectItem value="garanti">Garanti BBVA</SelectItem>
                <SelectItem value="isbank">İş Bankası</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Talep Tutarınız</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="Örn: 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white">
            Talep Oluştur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

