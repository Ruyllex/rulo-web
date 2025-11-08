// app/(dashboard)/u/[username]/logros/page.tsx
import { redirect } from "next/navigation";
import { getSelf } from "@/lib/auth-service";
import { getAchievementStats } from "@/lib/achievements-service";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Trophy, 
  Clock, 
  Eye, 
  MessageSquare, 
  DollarSign,
  CheckCircle2,
  Shield,
  Star,
  Crown,
  Award
} from "lucide-react";

export default async function LogrosPage({
  params,
}: {
  params: { username: string };
}) {
  const self = await getSelf();

  if (!self || self.username !== params.username) {
    redirect("/");
  }

  const stats = await getAchievementStats(self.id);

  // Nivel 1: Creador RULO
  const creadorReqs = [
    { current: stats.totalStreamHours, target: 2, isComplete: stats.totalStreamHours >= 2 },
    { current: stats.uniqueChattersTotal, target: 3, isComplete: stats.uniqueChattersTotal >= 3 },
    { current: stats.totalFollowers, target: 10, isComplete: stats.totalFollowers >= 10 },
  ];
  const creadorCompleted = creadorReqs.filter(r => r.isComplete).length;

  // Nivel 2: Verificación RULO
  const verificacionReqs = [
    { current: stats.subscribersLast30Days, target: 5, isComplete: stats.subscribersLast30Days >= 5 },
    { current: stats.averageViewersLast30Days, target: 10, isComplete: stats.averageViewersLast30Days >= 10 },
    { current: stats.streamHoursLast30Days, target: 5, isComplete: stats.streamHoursLast30Days >= 5 },
    { current: stats.uniqueChattersLast30Days, target: 5, isComplete: stats.uniqueChattersLast30Days >= 5 },
  ];
  const verificacionCompleted = verificacionReqs.filter(r => r.isComplete).length;

  // Nivel 3: Socio RULO
  const socioReqs = [
    { current: stats.subscribersLast30Days, target: 10, isComplete: stats.subscribersLast30Days >= 10 },
    { current: stats.averageViewersLast30Days, target: 25, isComplete: stats.averageViewersLast30Days >= 25 },
    { current: stats.streamHoursLast30Days, target: 15, isComplete: stats.streamHoursLast30Days >= 15 },
    { current: stats.uniqueChattersLast30Days, target: 50, isComplete: stats.uniqueChattersLast30Days >= 50 },
    { current: stats.totalFollowers, target: 75, isComplete: stats.totalFollowers >= 75 },
  ];
  const socioCompleted = socioReqs.filter(r => r.isComplete).length;

  const achievements = [
    {
      title: "Creador RULO",
      subtitle: "Nivel 1",
      description: "Acceso inicial a monetización",
      icon: Star,
      color: "orange",
      current: creadorCompleted,
      total: 3,
      requirements: [
        { label: "Transmite un total de", value: stats.totalStreamHours, target: 2, unit: "horas", icon: Clock, isComplete: creadorReqs[0].isComplete },
        { label: "Usuarios únicos en chat", value: stats.uniqueChattersTotal, target: 3, unit: "usuarios", icon: MessageSquare, isComplete: creadorReqs[1].isComplete },
        { label: "Seguidores mínimos", value: stats.totalFollowers, target: 10, unit: "seguidores", icon: Heart, isComplete: creadorReqs[2].isComplete },
      ],
      benefits: [
        "Suscripciones activas (97% creador, 3% RULO)",
        "Insignia de Creador RULO",
        "Dashboard de estadísticas y monetización",
        "Aparición en secciones destacadas",
      ],
    },
    {
      title: "Verificación RULO",
      subtitle: "Nivel 2",
      description: "Creador activo y confiable",
      icon: CheckCircle2,
      color: "green",
      current: verificacionCompleted,
      total: 4,
      requirements: [
        { label: "Suscriptores en 30 días", value: stats.subscribersLast30Days, target: 5, unit: "subs", icon: DollarSign, isComplete: verificacionReqs[0].isComplete },
        { label: "Promedio de espectadores (30 días)", value: stats.averageViewersLast30Days, target: 10, unit: "viewers", icon: Eye, isComplete: verificacionReqs[1].isComplete },
        { label: "Horas transmitidas (30 días)", value: stats.streamHoursLast30Days, target: 5, unit: "horas", icon: Clock, isComplete: verificacionReqs[2].isComplete },
        { label: "Usuarios diferentes chateando (30 días)", value: stats.uniqueChattersLast30Days, target: 5, unit: "usuarios", icon: MessageSquare, isComplete: verificacionReqs[3].isComplete },
      ],
      benefits: [
        "Insignia Verificado RULO",
        "Prioridad en descubrimiento",
        "Soporte directo",
        "Acceso early a nuevas features",
      ],
      note: "Cumplir requisitos permite aplicar. También puedes ser invitado como Creador Fundador.",
      needsTwoFactor: true,
    },
    {
      title: "Socio RULO",
      subtitle: "Nivel 3",
      description: "Creador profesional con comunidad sólida",
      icon: Crown,
      color: "purple",
      current: socioCompleted,
      total: 5,
      requirements: [
        { label: "Suscriptores en 30 días", value: stats.subscribersLast30Days, target: 10, unit: "subs", icon: DollarSign, isComplete: socioReqs[0].isComplete },
        { label: "Promedio de espectadores", value: stats.averageViewersLast30Days, target: 25, unit: "viewers", icon: Eye, isComplete: socioReqs[1].isComplete },
        { label: "Horas transmitidas (30 días)", value: stats.streamHoursLast30Days, target: 15, unit: "horas", icon: Clock, isComplete: socioReqs[2].isComplete },
        { label: "Usuarios en chat (30 días)", value: stats.uniqueChattersLast30Days, target: 50, unit: "usuarios", icon: MessageSquare, isComplete: socioReqs[3].isComplete },
        { label: "Seguidores totales", value: stats.totalFollowers, target: 75, unit: "seguidores", icon: Heart, isComplete: socioReqs[4].isComplete },
      ],
      benefits: [
        "Ingresos por publicidad",
        "Campañas y patrocinios internos",
        "Eventos exclusivos",
        "Contacto directo con el equipo",
        "Destacados globales automáticos",
      ],
      note: "Cumplir requisitos permite aplicar. También puedes ser invitado como Creador Fundador.",
      needsTwoFactor: true,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Programa de Creadores RULO
          </h1>
          <p className="text-muted-foreground mt-1">
            Desbloquea niveles y monetiza tu contenido
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {achievements.map((achievement, idx) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.current / achievement.total) * 100;
          const isCompleted = achievement.current === achievement.total;

          return (
            <Card key={idx} className="p-6 border-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg bg-${achievement.color}-500/10`}>
                    <Icon className={`h-6 w-6 text-${achievement.color}-500`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{achievement.title}</h2>
                      <Badge variant={isCompleted ? "default" : "outline"} className="text-xs">
                        {achievement.subtitle}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {achievement.current}/{achievement.total}
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progreso</span>
                  <span className="font-bold">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Requisitos
                  </h3>
                  
                  {achievement.requirements.map((req, reqIdx) => {
                    const ReqIcon = req.icon;
                    const reqProgress = (req.value / req.target) * 100;

                    return (
                      <div key={reqIdx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ReqIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{req.label}</span>
                            {req.isComplete && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <span className="text-sm font-bold">
                            {req.value.toFixed(req.unit === "horas" ? 1 : 0)}/{req.target}
                          </span>
                        </div>
                        <Progress value={Math.min(reqProgress, 100)} className="h-1.5" />
                      </div>
                    );
                  })}

                  {achievement.note && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        {achievement.note}
                      </p>
                    </div>
                  )}

                  {achievement.needsTwoFactor && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <Shield className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Requiere autenticación de dos factores (2FA)
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Beneficios
                  </h3>
                  <ul className="space-y-2">
                    {achievement.benefits.map((benefit, benIdx) => (
                      <li key={benIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {isCompleted && (
                    <Button className="w-full mt-4" size="lg">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aplicar Ahora
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}