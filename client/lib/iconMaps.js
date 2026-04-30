// Icon mapping utilities for Food Donation Platform
import {
  // Food icons
  Apple,
  Pizza,
  Sandwich,
  Salad,
  Milk,
  Beef,
  Cookie,
  Utensils,
  // Logistics icons
  Truck,
  Bus,
  MapPin,
  Navigation,
  Package,
  // Status icons
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  // Action icons
  Plus,
  Edit,
  Trash,
  Eye,
  Check,
  X,
  // UI icons
  Menu,
  Bell,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  Home,
  LayoutDashboard,
  Heart,
  Users,
  FileText,
  CreditCard,
  LogOut,
  Mail,
  Lock,
  Phone,
  MapPinned,
  Building,
  Thermometer,
  Calendar,
  Info,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Activity,
  DollarSign,
  Award,
  Star,
  Shield,
  Ban
} from 'lucide-react';

// Map food types to appropriate icons
export const foodIconMap = {
  pizza: Pizza,
  bread: Sandwich,
  sandwich: Sandwich,
  vegetables: Salad,
  salad: Salad,
  fruits: Apple,
  fruit: Apple,
  apple: Apple,
  dairy: Milk,
  milk: Milk,
  meat: Beef,
  beef: Beef,
  snacks: Cookie,
  cookie: Cookie,
  rice: Utensils,
  pasta: Utensils,
  default: Utensils
};

// Get food icon based on food type string
export const getFoodIcon = (foodType) => {
  if (!foodType) return foodIconMap.default;
  const type = foodType.toLowerCase().trim();
  return foodIconMap[type] || foodIconMap.default;
};

// Map status to icons
export const statusIconMap = {
  pending: Clock,
  accepted: CheckCircle,
  delivered: Package,
  cancelled: XCircle,
  rejected: XCircle,
  verified: CheckCircle,
  unverified: AlertCircle
};

// Get status icon
export const getStatusIcon = (status) => {
  if (!status) return AlertCircle;
  const statusLower = status.toLowerCase();
  return statusIconMap[statusLower] || AlertCircle;
};

// Map status to colors (Tailwind classes)
export const statusColorMap = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    badge: 'bg-yellow-500'
  },
  accepted: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    badge: 'bg-green-500'
  },
  delivered: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    badge: 'bg-blue-500'
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    badge: 'bg-red-500'
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    badge: 'bg-red-500'
  },
  verified: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    badge: 'bg-green-500'
  },
  unverified: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    badge: 'bg-gray-500'
  }
};

// Get status colors
export const getStatusColors = (status) => {
  if (!status) return statusColorMap.pending;
  const statusLower = status.toLowerCase();
  return statusColorMap[statusLower] || statusColorMap.pending;
};

// Export all icons for direct use
export {
  // Food
  Apple,
  Pizza,
  Sandwich,
  Salad,
  Milk,
  Beef,
  Cookie,
  Utensils,
  // Logistics
  Truck,
  Bus,
  MapPin,
  Navigation,
  Package,
  // Status
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  // Actions
  Plus,
  Edit,
  Trash,
  Eye,
  Check,
  X,
  // UI
  Menu,
  Bell,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  Home,
  LayoutDashboard,
  Heart,
  Users,
  FileText,
  CreditCard,
  LogOut,
  Mail,
  Lock,
  Phone,
  MapPinned,
  Building,
  Thermometer,
  Calendar,
  Info,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Activity,
  DollarSign,
  Award,
  Star,
  Shield,
  Ban
};
