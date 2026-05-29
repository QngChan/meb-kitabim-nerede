'use client'

import {
  BookOpen, Globe, Clock, Lightbulb, Flag, Sigma, Atom, FlaskConical,
  Dna, MessageSquareText, BookA, Rocket, Dumbbell, Monitor,
  Music, Palette, Brain, HeartPulse, ClipboardPlus, Scale,
  Landmark, FileText, FolderOpen, UserCheck, Waypoints,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  "tde": BookOpen,
  "tarih": Clock,
  "cografya": Globe,
  "felsefe": Lightbulb,
  "inkilap-tarihi": Flag,
  "matematik": Sigma,
  "fl-matematik": Sigma,
  "matematik-temel-duzey": Sigma,
  "fizik": Atom,
  "fl-fizik": Atom,
  "kimya": FlaskConical,
  "fl-kimya": FlaskConical,
  "biyoloji": Dna,
  "fl-biyoloji": Dna,
  "ingilizce": MessageSquareText,
  "bingilizce": MessageSquareText,
  "hazirlik-ingilizce": MessageSquareText,
  "almanca": BookA,
  "fransizca": BookA,
  "astronomi-uzay-bilimleri": Rocket,
  "beden-egitimi": Dumbbell,
  "bilgisayar-bilimi": Monitor,
  "muzik": Music,
  "gorsel-sanatlar": Palette,
  "psikoloji": Brain,
  "sosyoloji": Brain,
  "mantik": Waypoints,
  "bilgi-kurami": Lightbulb,
  "din": Landmark,
  "saglik-bilgisi-trafik-kulturu": HeartPulse,
  "proje-hazirlama": ClipboardPlus,
  "insan-haklari": Scale,
  "ekonomi": FileText,
  "isletme": FolderOpen,
  "girisimcilik": UserCheck,
  "sanat-tarihi": Palette,
  "cagdas-turk-tarihi": Clock,
  "ortak-turk-tarihi": Clock,
  "ortak-turk-edebiyati": BookOpen,
  "osmanlica-10": BookA,
  "osmanlica-11": BookA,
  "osmanlica-12": BookA,
  "osmanli-turkcesi-1": BookA,
  "osmanli-turkcesi-2": BookA,
  "osmanli-turkcesi-3": BookA,
  "turk-dunyasi-cografyasi": Globe,
  "turk-kultur-tarihi": Clock,
  "turk-sosyal-hayatinda-aile": UserCheck,
  "uluslararasi-iliskiler": Globe,
  "yonetim-bilimi": FolderOpen,
  "sosyal-etkinlik": UserCheck,
}

export default function SubjectIcon({ slug, size = 48 }: { slug: string; size?: number }) {
  const Icon = iconMap[slug] || FolderOpen
  const iconSize = Math.round(size * 0.5)

  return (
    <span style={{
      width: size, height: size, borderRadius: 10,
      background: "var(--blue-light)", color: "var(--blue)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={iconSize} />
    </span>
  )
}
