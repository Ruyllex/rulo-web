// lib/livekit-service.ts
import { AccessToken } from "livekit-server-sdk";
import { IngressClient, IngressInput, IngressVideoEncodingPreset, RoomServiceClient } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;

// Validar credenciales al cargar el módulo
if (!apiKey || !apiSecret || !wsUrl) {
  console.error("❌ Missing LiveKit credentials!");
  console.error("LIVEKIT_API_KEY:", apiKey ? "✓ Set" : "✗ Missing");
  console.error("LIVEKIT_API_SECRET:", apiSecret ? "✓ Set" : "✗ Missing");
  console.error("NEXT_PUBLIC_LIVEKIT_WS_URL:", wsUrl ? "✓ Set" : "✗ Missing");
  throw new Error("Missing LiveKit credentials - check your .env file");
}

console.log("✅ LiveKit credentials loaded successfully");
console.log("WebSocket URL:", wsUrl);

// Cliente para gestionar ingress
const ingressClient = new IngressClient(wsUrl, apiKey, apiSecret);
const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

/**
 * Crea un token de acceso genérico para LiveKit
 * Usado tanto para hosts (publishers) como para viewers
 */
export const createLiveKitToken = ({
  identity,
  roomName,
  isPublisher = false,
}: {
  identity: string;
  roomName: string;
  isPublisher?: boolean;
}) => {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "1h",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isPublisher,
    canPublishData: isPublisher,
    canSubscribe: true,
  });

  return at.toJwt();
};

/**
 * Crea un token de acceso para un viewer
 */
export const createViewerToken = async (
  identity: string,
  roomName: string
) => {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "1h",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: false,
    canSubscribe: true,
  });

  return await at.toJwt();
};

/**
 * Crea un ingress RTMP para que el streamer use OBS
 */
export const createIngress = async (
  streamerId: string,
  username: string
) => {
  try {
    console.log(`Creating ingress for ${username} (${streamerId})...`);
    
    // MEJORADO: Intentar limpiar todos los ingress del usuario
    await resetIngresses(streamerId);

    const options = {
      name: `${username}-ingress`,
      roomName: streamerId,
      participantName: username,
      participantIdentity: streamerId,
      video: {
        preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS
      }
    };

    console.log("Creating ingress with options:", options);

    const ingress = await ingressClient.createIngress(
      IngressInput.RTMP_INPUT,
      options
    );

    console.log(`✅ Ingress created successfully`);
    console.log(`   URL: ${ingress.url}`);
    console.log(`   Stream Key: ${ingress.streamKey?.substring(0, 20)}...`);

    return {
      ingressId: ingress.ingressId,
      url: ingress.url,
      streamKey: ingress.streamKey,
    };
  } catch (error: any) {
    console.error("❌ Error creating ingress:", error);
    
    // MEJORADO: Si el error es de límite alcanzado, intentar limpiar TODOS los ingress
    if (error?.response?.status === 429 || 
        error?.response?.data?.code === "resource_exhausted") {
      console.log("🧹 Límite alcanzado. Limpiando TODOS los ingress...");
      
      try {
        await cleanAllIngress();
        console.log("✅ Ingress limpiados. Reintentando...");
        
        // Reintentar crear ingress después de limpiar
        const ingress = await ingressClient.createIngress(
          IngressInput.RTMP_INPUT,
          {
            name: `${username}-ingress`,
            roomName: streamerId,
            participantName: username,
            participantIdentity: streamerId,
            video: {
              preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS
            }
          }
        );
        
        console.log(`✅ Ingress creado exitosamente después de limpiar`);
        return {
          ingressId: ingress.ingressId,
          url: ingress.url,
          streamKey: ingress.streamKey,
        };
      } catch (retryError) {
        console.error("❌ Error al reintentar después de limpiar:", retryError);
        throw new Error("No se pudo crear ingress. Ve a LiveKit Dashboard y elimina los ingress manualmente.");
      }
    }
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
};

/**
 * Elimina todos los ingress de un streamer específico
 */
export const resetIngresses = async (streamerId: string) => {
  try {
    const ingresses = await ingressClient.listIngress({
      roomName: streamerId,
    });

    if (ingresses && ingresses.length > 0) {
      console.log(`Found ${ingresses.length} existing ingress(es) for ${streamerId}`);

      for (const ingress of ingresses) {
        if (ingress.ingressId) {
          console.log(`Deleting old ingress: ${ingress.ingressId}`);
          await ingressClient.deleteIngress(ingress.ingressId);
        }
      }
    } else {
      console.log(`No existing ingresses found for ${streamerId}`);
    }
  } catch (error) {
    console.error("Error resetting ingresses:", error);
    // No lanzar error aquí, solo log
  }
};

/**
 * NUEVO: Limpia TODOS los ingress (no solo de un usuario)
 * Útil cuando se alcanza el límite
 */
export const cleanAllIngress = async () => {
  try {
    console.log("🧹 Limpiando TODOS los ingress...");
    
    // Listar todos los ingress sin filtro
    const ingresses = await ingressClient.listIngress({});
    
    console.log(`📋 Encontrados: ${ingresses.length} ingress en total`);
    
    if (ingresses.length === 0) {
      console.log("✅ No hay ingress para limpiar");
      return;
    }

    for (const ingress of ingresses) {
      try {
        console.log(`  🗑️  Eliminando: ${ingress.name || ingress.ingressId}`);
        await ingressClient.deleteIngress(ingress.ingressId!);
      } catch (deleteError) {
        console.error(`  ❌ Error eliminando ${ingress.ingressId}:`, deleteError);
        // Continuar con el siguiente
      }
    }
    
    console.log("✅ Limpieza completada");
  } catch (error) {
    console.error("❌ Error en cleanAllIngress:", error);
    throw error;
  }
};

/**
 * Lista todas las rooms activas
 */
export const listRooms = async () => {
  try {
    const rooms = await roomService.listRooms();
    return rooms || [];
  } catch (error) {
    console.error("Error listing rooms:", error);
    return [];
  }
};

/**
 * Verifica si una room está activa
 */
export const isRoomActive = async (roomName: string) => {
  try {
    const rooms = await listRooms();
    return rooms.some((room) => room.name === roomName);
  } catch (error) {
    console.error("Error checking if room is active:", error);
    return false;
  }
};