'use client';

import { useState } from 'react';
import { SolcitoStore } from '@/components/solcito/solcito-store';
import { SolcitoCheer } from '@/components/stream/solcito-cheer';
import { StreamAlert } from '@/components/stream/stream-alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Gift,
  Bell,
  Coins,
  CreditCard,
  Shield,
  Star,
  Sparkles,
  ChevronRight,
  ShoppingCart,
  Heart,
  UserPlus,
  Sun,
  Trophy,
  MessageCircle,
  Headphones,
  Mail,
  Clock
} from 'lucide-react';

interface ShowcaseClientProps {
  user: {
    id: string;
    username: string;
    solcitosBalance: number;
    totalSolcitosEarned: number;
    availableBalance: number;
    isStreamer: boolean;
  };
  packages: Array<{
    id: string;
    name: string;
    amount: number;
    bonus: number;
    price: number;
    order: number;
  }>;
  stats: {
    totalEarnings: number;
    thisMonthEarnings: number;
    totalDonations: number;
    totalSubscribers: number;
  } | null;
}

export function ShowcaseClient({ user, packages, stats }: ShowcaseClientProps) {
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('store');
  
  const sampleAlerts = [
    { id: '1', type: 'cheer', fromUser: 'JuanGamer', amount: 500, message: 'Gran stream!' },
    { id: '2', type: 'donation', fromUser: 'MariaFan', amount: 10 },
    { id: '3', type: 'subscription', fromUser: 'PedroSub', tier: '2' },
    { id: '4', type: 'follow', fromUser: 'NuevoFollower' },
    { id: '5', type: 'cheer', fromUser: 'MegaFan', amount: 10000, message: 'ÉPICO!' },
  ];

  const showAlert = (alert: any) => {
    setCurrentAlert(alert);
    setTimeout(() => setCurrentAlert(null), 9000);
  };

  const menuItems = [
    { id: 'store', label: 'Tienda', icon: ShoppingCart },
    { id: 'cheer', label: 'Cheers', icon: Heart },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'pricing', label: 'Precios', icon: DollarSign },
    { id: 'support', label: 'Soporte', icon: Headphones },
  ];

  const handleWhatsApp = () => {
    const phoneNumber = "5491130652655"; 
    const message = encodeURIComponent(
      "Hola, necesito ayuda con la plataforma de streaming"
    );
    
    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      <StreamAlert alert={currentAlert} />

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="w-60 bg-[#1f1f23] min-h-[calc(100vh-80px)] border-r border-[#2d2d35] fixed left-0">
          <div className="p-4">
            {/* Balance del usuario */}
            <div className="mb-4 p-3 bg-cyan-600/10 rounded-lg border border-cyan-600/20">
              <p className="text-xs text-gray-400 mb-1">Tu Balance</p>
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-cyan-400" />
                <span className="text-lg font-bold text-white">
                  {user.solcitosBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <h3 className="text-gray-400 text-xs font-semibold uppercase mb-4">Componentes</h3>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      activeSection === item.id
                        ? 'bg-cyan-600/20 text-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-[#2d2d35]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {activeSection === item.id && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 p-4 bg-cyan-600/10 rounded-lg border border-cyan-600/20">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Seguridad</span>
              </div>
              <p className="text-xs text-gray-400">
                Pagos procesados de forma segura con encriptación de nivel bancario
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-60">
          {/* Store Section */}
          {activeSection === 'store' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Tienda de Solcitos</h1>
                <p className="text-gray-400">Compra Solcitos para apoyar a tus streamers favoritos</p>
              </div>
              <SolcitoStore 
                currentBalance={user.solcitosBalance}
                onPurchaseComplete={() => window.location.reload()}
              />
            </div>
          )}

          {/* Cheer Section */}
          {activeSection === 'cheer' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Sistema de Cheers</h1>
                <p className="text-gray-400">Envía Solcitos para destacar tu mensaje en el chat</p>
              </div>
              <Card className="bg-[#18181b] border-[#2d2d35]">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-600/20 rounded-full">
                      <Heart className="h-10 w-10 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Apoya a {user.username}</h3>
                      <p className="text-gray-400 mb-4">Tu balance actual: {user.solcitosBalance.toLocaleString()} Solcitos</p>
                    </div>
                    <SolcitoCheer 
                      streamerId={user.id}
                      streamerName={user.username}
                      userBalance={user.solcitosBalance}
                      onCheerSent={() => {
                        showAlert({
                          id: Date.now(),
                          type: 'cheer',
                          fromUser: user.username,
                          amount: 100,
                          message: 'Test de cheer'
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Sistema de Alertas</h1>
                <p className="text-gray-400">Notificaciones animadas que aparecen en stream</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'cheer', label: 'Cheer 500', icon: Sun, color: 'cyan', alert: sampleAlerts[0] },
                  { type: 'donation', label: 'Donación $10', icon: DollarSign, color: 'green', alert: sampleAlerts[1] },
                  { type: 'subscription', label: 'Nueva Sub', icon: Star, color: 'yellow', alert: sampleAlerts[2] },
                  { type: 'follow', label: 'Nuevo Follow', icon: UserPlus, color: 'blue', alert: sampleAlerts[3] },
                  { type: 'mega', label: 'Mega Cheer', icon: Trophy, color: 'red', alert: sampleAlerts[4] },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.type}
                      className="bg-[#18181b] border-[#2d2d35] cursor-pointer hover:border-cyan-500 transition-colors"
                      onClick={() => showAlert(item.alert)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 bg-${item.color}-600/20 rounded-lg`}>
                            <Icon className={`h-6 w-6 text-${item.color}-500`} />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{item.label}</h3>
                            <p className="text-gray-500 text-sm">Click para probar</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {activeSection === 'pricing' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Tabla de Precios</h1>
                <p className="text-gray-400">Paquetes de Solcitos disponibles</p>
              </div>
              
              <div className="bg-[#18181b] rounded-lg border border-[#2d2d35] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#1f1f23]">
                    <tr>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Paquete</th>
                      <th className="text-center px-6 py-4 text-gray-400 font-medium text-sm">Solcitos</th>
                      <th className="text-center px-6 py-4 text-gray-400 font-medium text-sm">Bonus</th>
                      <th className="text-center px-6 py-4 text-gray-400 font-medium text-sm">Total</th>
                      <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d2d35]">
                    {packages.map((pkg, idx) => (
                      <tr key={pkg.id} className="hover:bg-[#2d2d35]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {idx === 3 && <Star className="h-4 w-4 text-yellow-500" />}
                            <span className="text-white font-medium">{pkg.name}</span>
                            {idx === 3 && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Popular</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center px-6 py-4 text-gray-300">{pkg.amount.toLocaleString()}</td>
                        <td className="text-center px-6 py-4">
                          {pkg.bonus > 0 ? (
                            <span className="text-green-400">+{pkg.bonus}</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="text-center px-6 py-4">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-cyan-400 font-semibold">{(pkg.amount + pkg.bonus).toLocaleString()}</span>
                            <Coins className="h-4 w-4 text-cyan-400" />
                          </div>
                        </td>
                        <td className="text-right px-6 py-4 text-white font-bold">${pkg.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                {[
                  { icon: Sparkles, title: 'Comisión Baja', desc: 'Solo 3% en Solcitos' },
                  { icon: CreditCard, title: 'Pagos Múltiples', desc: 'MercadoPago, Stripe y más' },
                  { icon: Gift, title: 'Sistema de Bonus', desc: `Hasta ${Math.max(...packages.map(p => p.bonus))} Solcitos extra` },
                  { icon: Shield, title: 'Pagos Seguros', desc: 'Encriptación SSL' },
                  { icon: TrendingUp, title: 'Analytics', desc: 'Métricas en tiempo real' },
                  { icon: Users, title: 'Soporte 24/7', desc: 'Ayuda cuando la necesites' },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={idx} className="bg-[#18181b] border-[#2d2d35]">
                      <CardContent className="p-6">
                        <Icon className="h-8 w-8 text-cyan-500 mb-3" />
                        <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                        <p className="text-gray-400 text-sm">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Support Section */}
          {activeSection === 'support' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Centro de Soporte</h1>
                <p className="text-gray-400">¿Necesitas ayuda? Estamos aquí para ti</p>
              </div>

              {/* WhatsApp Card Principal */}
              <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/30 mb-6">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50 animate-pulse">
                      <MessageCircle className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Soporte por WhatsApp
                      </h2>
                      <p className="text-gray-400 mb-6">
                        Chatea con nuestro equipo de soporte. Respuesta rápida garantizada.
                      </p>
                      <Button
                        onClick={handleWhatsApp}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30 hover:scale-105 transition-all text-lg px-8"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Abrir WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#18181b] border-cyan-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <Clock className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Horario de Atención</h3>
                        <p className="text-gray-400 text-sm">
                          Lunes a Domingo<br />
                          9:00 AM - 10:00 PM (ART)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#18181b] border-cyan-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <Mail className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Email de Soporte</h3>
                        <p className="text-gray-400 text-sm">
                          soporte@rulo.com<br />
                          Respuesta en 24-48 horas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Preview */}
              <Card className="bg-[#18181b] border-cyan-500/20 mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    Preguntas Frecuentes
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <p className="text-gray-400">
                        <span className="text-white font-medium">¿Cómo compro Solcitos?</span> - Ve a la sección Tienda y selecciona un paquete
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <p className="text-gray-400">
                        <span className="text-white font-medium">¿Cuánto tarda la acreditación?</span> - 5-10 minutos para transferencias, instantáneo para PayPal
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <p className="text-gray-400">
                        <span className="text-white font-medium">¿Cómo empiezo a streamear?</span> - Activa tu cuenta de streamer en el Studio
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}