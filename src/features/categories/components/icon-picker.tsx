import { cn } from "@/shared/utils";
import {
  Check,
  Smile,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  BellRing,
  Book,
  Calendar,
  Camera,
  Car,
  Coffee,
  CreditCard,
  DollarSign,
  Gift,
  Globe,
  Heart,
  Home,
  Laptop,
  Music,
  Phone,
  Pizza,
  ShoppingBag,
  Star,
  Ticket,
  Umbrella,
  Wallet,
} from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Input } from "@/shared/components/ui/input";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

const LUCIDE_ICONS = [
  { name: "AlertCircle", icon: AlertCircle },
  { name: "ArrowDownCircle", icon: ArrowDownCircle },
  { name: "ArrowUpCircle", icon: ArrowUpCircle },
  { name: "BellRing", icon: BellRing },
  { name: "Book", icon: Book },
  { name: "Calendar", icon: Calendar },
  { name: "Camera", icon: Camera },
  { name: "Car", icon: Car },
  { name: "Coffee", icon: Coffee },
  { name: "CreditCard", icon: CreditCard },
  { name: "DollarSign", icon: DollarSign },
  { name: "Gift", icon: Gift },
  { name: "Globe", icon: Globe },
  { name: "Heart", icon: Heart },
  { name: "Home", icon: Home },
  { name: "Laptop", icon: Laptop },
  { name: "Music", icon: Music },
  { name: "Phone", icon: Phone },
  { name: "Pizza", icon: Pizza },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Star", icon: Star },
  { name: "Ticket", icon: Ticket },
  { name: "Umbrella", icon: Umbrella },
  { name: "Wallet", icon: Wallet },
];

const EMOJIS = [
  "💰",
  "💵",
  "💳",
  "🏦",
  "🏠",
  "🚗",
  "✈️",
  "🍔",
  "🛒",
  "🎮",
  "📱",
  "💻",
  "📚",
  "🎓",
  "🏥",
  "💊",
  "🎬",
  "🎭",
  "🎨",
  "🎪",
  "⚽️",
  "🎾",
  "🏊‍♂️",
  "🏋️‍♂️",
  "🚌",
  "🚇",
  "🚖",
  "🛵",
  "⛽️",
  "🔧",
  "👕",
  "👞",
  "💄",
  "💅",
  "💇‍♂️",
  "🎁",
  "🎊",
  "🎉",
  "🎂",
  "🍾",
  "☕️",
  "🍺",
  "🍷",
  "🍽️",
  "🌮",
  "🍕",
  "🍣",
  "🥗",
  "🏪",
  "🏢",
  "📈",
  "💼",
  "📊",
  "💡",
  "🔨",
  "🛠️",
  "📝",
  "✏️",
  "🎯",
  "🎲",
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<"lucide" | "emoji">("lucide");

  const filteredIcons = LUCIDE_ICONS.filter(({ name }) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmojis = EMOJIS.filter((emoji) =>
    search ? emoji.toLowerCase().includes(search.toLowerCase()) : true
  );

  const isEmojiSelected = value?.startsWith("emoji:");
  const selectedEmoji =
    isEmojiSelected && value ? value.replace("emoji:", "") : null;

  return (
    <div className="space-y-2">
      <Input
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-10"
      />
      <Tabs
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as "lucide" | "emoji")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lucide" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Ícones
          </TabsTrigger>
          <TabsTrigger value="emoji" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Emojis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lucide" className="mt-2">
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="grid grid-cols-6 gap-2 p-2">
              {filteredIcons.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-md border",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    value === name && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => onChange(name)}
                  type="button"
                  title={name}
                >
                  <Icon className="h-6 w-6" />
                  {value === name && (
                    <div className="absolute bottom-1 right-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="emoji" className="mt-2">
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="grid grid-cols-6 gap-2 p-2">
              {filteredEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-md border text-xl",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selectedEmoji === emoji &&
                      "bg-primary text-primary-foreground"
                  )}
                  onClick={() => onChange(`emoji:${emoji}`)}
                  type="button"
                >
                  {emoji}
                  {selectedEmoji === emoji && (
                    <div className="absolute bottom-1 right-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
