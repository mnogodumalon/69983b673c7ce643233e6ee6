import { useState, useEffect, useMemo, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import { Plus, Pencil, Trash2, Package, Tag, Phone, Mail, ImageIcon, Upload, Loader2, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

import type { Kategorien, MarktplatzAngebote } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { analyzeProductImage, fileToBase64 } from '@/services/imageAnalysisService';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Currency formatter
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// ============================================
// ANGEBOT (Product) DIALOG
// ============================================
interface AngebotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  angebot?: MarktplatzAngebote | null;
  kategorien: Kategorien[];
  onSuccess: () => void;
}

function AngebotDialog({ open, onOpenChange, angebot, kategorien, onSuccess }: AngebotDialogProps) {
  const isEditing = !!angebot;
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    hersteller: '',
    modell: '',
    farbe: '',
    groesse: '',
    kategorie: '',
    preis: '',
    produktbeschreibung: '',
    kontakt_vorname: '',
    kontakt_nachname: '',
    kontakt_email: '',
    kontakt_telefon: '',
  });

  useEffect(() => {
    if (open) {
      if (angebot) {
        const kategorieId = extractRecordId(angebot.fields.kategorie);
        setFormData({
          hersteller: angebot.fields.hersteller ?? '',
          modell: angebot.fields.modell ?? '',
          farbe: angebot.fields.farbe ?? '',
          groesse: angebot.fields.groesse ?? '',
          kategorie: kategorieId ?? '',
          preis: angebot.fields.preis?.toString() ?? '',
          produktbeschreibung: angebot.fields.produktbeschreibung ?? '',
          kontakt_vorname: angebot.fields.kontakt_vorname ?? '',
          kontakt_nachname: angebot.fields.kontakt_nachname ?? '',
          kontakt_email: angebot.fields.kontakt_email ?? '',
          kontakt_telefon: angebot.fields.kontakt_telefon ?? '',
        });
      } else {
        setFormData({
          hersteller: '',
          modell: '',
          farbe: '',
          groesse: '',
          kategorie: '',
          preis: '',
          produktbeschreibung: '',
          kontakt_vorname: '',
          kontakt_nachname: '',
          kontakt_email: '',
          kontakt_telefon: '',
        });
        setImagePreview(null);
      }
    }
  }, [open, angebot]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Analyze with AI
    setAnalyzing(true);
    const loadingToastId = toast.loading('Foto wird analysiert...');

    try {
      const { base64, mediaType } = await fileToBase64(file);
      const productInfo = await analyzeProductImage(base64, mediaType);

      // Auto-fill form fields (only fill empty fields or all if creating new)
      setFormData((prev) => ({
        ...prev,
        hersteller: productInfo.hersteller || prev.hersteller,
        modell: productInfo.modell || prev.modell,
        farbe: productInfo.farbe || prev.farbe,
        groesse: productInfo.groesse || prev.groesse,
        produktbeschreibung: productInfo.produktbeschreibung || prev.produktbeschreibung,
        preis: productInfo.preis || prev.preis,
      }));

      toast.dismiss(loadingToastId);
      toast.success('Produktinfos aus Foto erkannt!', {
        description: productInfo.hersteller
          ? `${productInfo.hersteller}${productInfo.modell ? ' ' + productInfo.modell : ''} erkannt`
          : 'Einige Felder wurden automatisch ausgefüllt',
      });
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error('Foto-Analyse fehlgeschlagen', {
        description: 'Bitte fülle die Felder manuell aus.',
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData: MarktplatzAngebote['fields'] = {
        hersteller: formData.hersteller || undefined,
        modell: formData.modell || undefined,
        farbe: formData.farbe || undefined,
        groesse: formData.groesse || undefined,
        kategorie: formData.kategorie
          ? createRecordUrl(APP_IDS.KATEGORIEN, formData.kategorie)
          : undefined,
        preis: formData.preis ? parseFloat(formData.preis) : undefined,
        produktbeschreibung: formData.produktbeschreibung || undefined,
        kontakt_vorname: formData.kontakt_vorname || undefined,
        kontakt_nachname: formData.kontakt_nachname || undefined,
        kontakt_email: formData.kontakt_email || undefined,
        kontakt_telefon: formData.kontakt_telefon || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateMarktplatzAngeboteEntry(angebot!.record_id, apiData);
        toast.success('Angebot aktualisiert');
      } else {
        await LivingAppsService.createMarktplatzAngeboteEntry(apiData);
        toast.success('Angebot erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload with AI Analysis */}
          <div className="space-y-2">
            <Label>Produktfoto</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Vorschau"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-background/80 rounded-lg flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium">KI analysiert Foto...</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={analyzing}
                >
                  Ändern
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Foto hochladen</span>
                <span className="text-xs text-muted-foreground">
                  KI erkennt automatisch Hersteller, Modell, Farbe & mehr
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hersteller">Hersteller *</Label>
              <Input
                id="hersteller"
                value={formData.hersteller}
                onChange={(e) => setFormData((prev) => ({ ...prev, hersteller: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modell">Modell</Label>
              <Input
                id="modell"
                value={formData.modell}
                onChange={(e) => setFormData((prev) => ({ ...prev, modell: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farbe">Farbe</Label>
              <Input
                id="farbe"
                value={formData.farbe}
                onChange={(e) => setFormData((prev) => ({ ...prev, farbe: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groesse">Größe</Label>
              <Input
                id="groesse"
                value={formData.groesse}
                onChange={(e) => setFormData((prev) => ({ ...prev, groesse: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategorie">Kategorie</Label>
              <Select
                value={formData.kategorie || 'none'}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, kategorie: v === 'none' ? '' : v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kategorie wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Kategorie</SelectItem>
                  {kategorien.map((k) => (
                    <SelectItem key={k.record_id} value={k.record_id}>
                      {k.fields.kategoriename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preis">Preis (EUR) *</Label>
              <Input
                id="preis"
                type="number"
                step="0.01"
                min="0"
                value={formData.preis}
                onChange={(e) => setFormData((prev) => ({ ...prev, preis: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="produktbeschreibung">Produktbeschreibung</Label>
            <Textarea
              id="produktbeschreibung"
              value={formData.produktbeschreibung}
              onChange={(e) => setFormData((prev) => ({ ...prev, produktbeschreibung: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Kontaktdaten</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kontakt_vorname">Vorname *</Label>
                <Input
                  id="kontakt_vorname"
                  value={formData.kontakt_vorname}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kontakt_vorname: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kontakt_nachname">Nachname</Label>
                <Input
                  id="kontakt_nachname"
                  value={formData.kontakt_nachname}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kontakt_nachname: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kontakt_email">E-Mail</Label>
                <Input
                  id="kontakt_email"
                  type="email"
                  value={formData.kontakt_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kontakt_email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kontakt_telefon">Telefon</Label>
                <Input
                  id="kontakt_telefon"
                  type="tel"
                  value={formData.kontakt_telefon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kontakt_telefon: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// ANGEBOT DETAIL DIALOG
// ============================================
interface AngebotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  angebot: MarktplatzAngebote | null;
  kategorien: Kategorien[];
  onEdit: () => void;
  onDelete: () => void;
}

function AngebotDetailDialog({
  open,
  onOpenChange,
  angebot,
  kategorien,
  onEdit,
  onDelete,
}: AngebotDetailDialogProps) {
  if (!angebot) return null;

  const kategorieId = extractRecordId(angebot.fields.kategorie);
  const kategorie = kategorieId ? kategorien.find((k) => k.record_id === kategorieId) : null;
  const title = [angebot.fields.hersteller, angebot.fields.modell].filter(Boolean).join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="pr-8">{title || 'Angebot'}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {angebot.fields.produktfotos ? (
            <img
              src={angebot.fields.produktfotos}
              alt={title}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-lg font-semibold">
              {formatCurrency(angebot.fields.preis)}
            </Badge>
            {kategorie && (
              <Badge variant="secondary" className="rounded-full">
                {kategorie.fields.kategoriename}
              </Badge>
            )}
          </div>

          {(angebot.fields.farbe || angebot.fields.groesse) && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              {angebot.fields.farbe && <span>Farbe: {angebot.fields.farbe}</span>}
              {angebot.fields.groesse && <span>Größe: {angebot.fields.groesse}</span>}
            </div>
          )}

          {angebot.fields.produktbeschreibung && (
            <div>
              <h4 className="font-medium text-sm mb-1">Beschreibung</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {angebot.fields.produktbeschreibung}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Kontakt</h4>
            <div className="space-y-1 text-sm">
              <p>
                {angebot.fields.kontakt_vorname} {angebot.fields.kontakt_nachname}
              </p>
              {angebot.fields.kontakt_email && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${angebot.fields.kontakt_email}`} className="hover:underline">
                    {angebot.fields.kontakt_email}
                  </a>
                </p>
              )}
              {angebot.fields.kontakt_telefon && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${angebot.fields.kontakt_telefon}`} className="hover:underline">
                    {angebot.fields.kontakt_telefon}
                  </a>
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Erstellt: {format(parseISO(angebot.createdat), 'PPP', { locale: de })}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Bearbeiten
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// KATEGORIE DIALOG
// ============================================
interface KategorieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategorie?: Kategorien | null;
  onSuccess: () => void;
}

function KategorieDialog({ open, onOpenChange, kategorie, onSuccess }: KategorieDialogProps) {
  const isEditing = !!kategorie;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    kategoriename: '',
    beschreibung: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        kategoriename: kategorie?.fields.kategoriename ?? '',
        beschreibung: kategorie?.fields.beschreibung ?? '',
      });
    }
  }, [open, kategorie]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData: Kategorien['fields'] = {
        kategoriename: formData.kategoriename || undefined,
        beschreibung: formData.beschreibung || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateKategorienEntry(kategorie!.record_id, apiData);
        toast.success('Kategorie aktualisiert');
      } else {
        await LivingAppsService.createKategorienEntry(apiData);
        toast.success('Kategorie erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kategoriename">Name *</Label>
            <Input
              id="kategoriename"
              value={formData.kategoriename}
              onChange={(e) => setFormData((prev) => ({ ...prev, kategoriename: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DELETE CONFIRMATION DIALOG
// ============================================
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

function DeleteDialog({ open, onOpenChange, title, description, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      toast.error('Löschen fehlgeschlagen');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// PRODUCT CARD
// ============================================
interface ProductCardProps {
  angebot: MarktplatzAngebote;
  kategorie?: Kategorien | null;
  onClick: () => void;
}

function ProductCard({ angebot, kategorie, onClick }: ProductCardProps) {
  const title = [angebot.fields.hersteller, angebot.fields.modell].filter(Boolean).join(' ');

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {angebot.fields.produktfotos ? (
          <img
            src={angebot.fields.produktfotos}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full px-3 font-semibold shadow-md">
          {formatCurrency(angebot.fields.preis)}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{title || 'Unbenannt'}</h3>
        <div className="flex items-center justify-between mt-2">
          {kategorie ? (
            <Badge variant="secondary" className="rounded-full text-xs">
              {kategorie.fields.kategoriename}
            </Badge>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {angebot.fields.kontakt_vorname}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// LOADING SKELETON
// ============================================
function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="text-center py-16">
      <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Noch keine Angebote</h3>
      <p className="text-muted-foreground mb-4">
        Erstelle dein erstes Angebot, um loszulegen.
      </p>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Erstes Angebot erstellen
      </Button>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD
// ============================================
export default function Dashboard() {
  // Data state
  const [angebote, setAngebote] = useState<MarktplatzAngebote[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter state
  const [filterKategorie, setFilterKategorie] = useState<string>('all');

  // Dialog states
  const [showAngebotDialog, setShowAngebotDialog] = useState(false);
  const [editAngebot, setEditAngebot] = useState<MarktplatzAngebote | null>(null);
  const [detailAngebot, setDetailAngebot] = useState<MarktplatzAngebote | null>(null);
  const [deleteAngebot, setDeleteAngebot] = useState<MarktplatzAngebote | null>(null);

  const [showKategorieDialog, setShowKategorieDialog] = useState(false);
  const [editKategorie, setEditKategorie] = useState<Kategorien | null>(null);
  const [deleteKategorie, setDeleteKategorie] = useState<Kategorien | null>(null);

  // Fetch data
  async function fetchData() {
    try {
      setLoading(true);
      const [angeboteData, kategorienData] = await Promise.all([
        LivingAppsService.getMarktplatzAngebote(),
        LivingAppsService.getKategorien(),
      ]);
      setAngebote(angeboteData);
      setKategorien(kategorienData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate KPIs
  const stats = useMemo(() => {
    const totalValue = angebote.reduce((sum, a) => sum + (a.fields.preis ?? 0), 0);
    const count = angebote.length;
    const avgPrice = count > 0 ? totalValue / count : 0;
    return { totalValue, count, avgPrice };
  }, [angebote]);

  // Create kategorie map
  const kategorieMap = useMemo(() => {
    const map = new Map<string, Kategorien>();
    kategorien.forEach((k) => map.set(k.record_id, k));
    return map;
  }, [kategorien]);

  // Count angebote per kategorie
  const angebotePerKategorie = useMemo(() => {
    const counts = new Map<string, number>();
    angebote.forEach((a) => {
      const kId = extractRecordId(a.fields.kategorie);
      if (kId) {
        counts.set(kId, (counts.get(kId) || 0) + 1);
      }
    });
    return counts;
  }, [angebote]);

  // Filter angebote
  const filteredAngebote = useMemo(() => {
    if (filterKategorie === 'all') return angebote;
    return angebote.filter((a) => {
      const kId = extractRecordId(a.fields.kategorie);
      return kId === filterKategorie;
    });
  }, [angebote, filterKategorie]);

  // Sort by newest first
  const sortedAngebote = useMemo(() => {
    return [...filteredAngebote].sort(
      (a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
    );
  }, [filteredAngebote]);

  // Handlers
  async function handleDeleteAngebot() {
    if (!deleteAngebot) return;
    await LivingAppsService.deleteMarktplatzAngeboteEntry(deleteAngebot.record_id);
    toast.success('Angebot gelöscht');
    setDeleteAngebot(null);
    setDetailAngebot(null);
    fetchData();
  }

  async function handleDeleteKategorie() {
    if (!deleteKategorie) return;
    await LivingAppsService.deleteKategorienEntry(deleteKategorie.record_id);
    toast.success('Kategorie gelöscht');
    setDeleteKategorie(null);
    fetchData();
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium mb-2">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={fetchData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Marktplatz</h1>
          <Button onClick={() => setShowAngebotDialog(true)} className="hidden md:flex">
            <Plus className="h-4 w-4 mr-2" />
            Angebot erstellen
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hero KPI - larger */}
              <Card className="md:col-span-2 bg-gradient-to-br from-card to-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Gesamtwert aller Angebote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    {formatCurrency(stats.totalValue)}
                  </div>
                  <Badge variant="secondary" className="mt-2 rounded-full">
                    {stats.count} Angebote aktiv
                  </Badge>
                </CardContent>
              </Card>

              {/* Secondary stats */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Durchschnittspreis</p>
                    <p className="text-xl font-semibold">{formatCurrency(stats.avgPrice)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Kategorien</p>
                    <p className="text-xl font-semibold">{kategorien.length}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
              <Select value={filterKategorie} onValueChange={setFilterKategorie}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {kategorien.map((k) => (
                    <SelectItem key={k.record_id} value={k.record_id}>
                      {k.fields.kategoriename} ({angebotePerKategorie.get(k.record_id) || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {sortedAngebote.length} Angebot{sortedAngebote.length !== 1 ? 'e' : ''}
              </span>
            </div>

            {/* Product Grid */}
            {sortedAngebote.length === 0 ? (
              <EmptyState onAddClick={() => setShowAngebotDialog(true)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedAngebote.map((angebot) => {
                  const kId = extractRecordId(angebot.fields.kategorie);
                  const kategorie = kId ? kategorieMap.get(kId) : null;
                  return (
                    <ProductCard
                      key={angebot.record_id}
                      angebot={angebot}
                      kategorie={kategorie}
                      onClick={() => setDetailAngebot(angebot)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Categories Management */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Kategorien verwalten</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditKategorie(null);
                      setShowKategorieDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {kategorien.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Kategorien
                  </p>
                ) : (
                  kategorien
                    .sort((a, b) =>
                      (a.fields.kategoriename ?? '').localeCompare(b.fields.kategoriename ?? '')
                    )
                    .map((k) => (
                      <div
                        key={k.record_id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted group"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{k.fields.kategoriename}</span>
                          <Badge variant="outline" className="text-xs rounded-full">
                            {angebotePerKategorie.get(k.record_id) || 0}
                          </Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditKategorie(k);
                              setShowKategorieDialog(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteKategorie(k)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preisspanne</span>
                  <span>
                    {angebote.length > 0
                      ? `${formatCurrency(
                          Math.min(...angebote.map((a) => a.fields.preis ?? 0))
                        )} - ${formatCurrency(
                          Math.max(...angebote.map((a) => a.fields.preis ?? 0))
                        )}`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meiste Angebote</span>
                  <span>
                    {kategorien.length > 0
                      ? kategorien.reduce((max, k) => {
                          const count = angebotePerKategorie.get(k.record_id) || 0;
                          const maxCount = angebotePerKategorie.get(max.record_id) || 0;
                          return count > maxCount ? k : max;
                        }).fields.kategoriename || '-'
                      : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        size="icon"
        onClick={() => setShowAngebotDialog(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AngebotDialog
        open={showAngebotDialog || !!editAngebot}
        onOpenChange={(open) => {
          if (!open) {
            setShowAngebotDialog(false);
            setEditAngebot(null);
          }
        }}
        angebot={editAngebot}
        kategorien={kategorien}
        onSuccess={fetchData}
      />

      <AngebotDetailDialog
        open={!!detailAngebot}
        onOpenChange={(open) => !open && setDetailAngebot(null)}
        angebot={detailAngebot}
        kategorien={kategorien}
        onEdit={() => {
          setEditAngebot(detailAngebot);
          setDetailAngebot(null);
        }}
        onDelete={() => {
          setDeleteAngebot(detailAngebot);
        }}
      />

      <KategorieDialog
        open={showKategorieDialog || !!editKategorie}
        onOpenChange={(open) => {
          if (!open) {
            setShowKategorieDialog(false);
            setEditKategorie(null);
          }
        }}
        kategorie={editKategorie}
        onSuccess={fetchData}
      />

      <DeleteDialog
        open={!!deleteAngebot}
        onOpenChange={(open) => !open && setDeleteAngebot(null)}
        title="Angebot löschen?"
        description={`Möchtest du das Angebot "${[deleteAngebot?.fields.hersteller, deleteAngebot?.fields.modell].filter(Boolean).join(' ')}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDeleteAngebot}
      />

      <DeleteDialog
        open={!!deleteKategorie}
        onOpenChange={(open) => !open && setDeleteKategorie(null)}
        title="Kategorie löschen?"
        description={`Möchtest du die Kategorie "${deleteKategorie?.fields.kategoriename}" wirklich löschen? Angebote in dieser Kategorie verlieren ihre Zuordnung.`}
        onConfirm={handleDeleteKategorie}
      />
    </div>
  );
}
