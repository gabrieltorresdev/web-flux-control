"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { refreshSession } from "@/features/auth/actions/session";
import { toast } from "sonner";

interface SessionKeepAliveProps {
  // Time in milliseconds before session refresh (default: 4 minutes)
  refreshInterval?: number;
  // Time in milliseconds of inactivity before considering the user idle (default: 30 minutes)
  idleTimeout?: number;
  // Time in milliseconds to check activity (default: 30 seconds)
  activityCheckInterval?: number;
  // Whether to show notification warnings (default: true)
  showNotifications?: boolean;
}

export function SessionKeepAlive({
  refreshInterval = 4 * 60 * 1000, // 4 minutes
  idleTimeout = 30 * 60 * 1000, // 30 minutes
  activityCheckInterval = 30 * 1000, // 30 seconds
  showNotifications = true,
}: SessionKeepAliveProps) {
  const { data: session, update } = useSession();
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());
  
  // Function to handle user activity
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isIdle) {
      setIsIdle(false);
    }
  }, [isIdle]);
  
  // Function to refresh the session
  const handleSessionRefresh = useCallback(async () => {
    try {
      if (!session) return;
      
      // Prevent multiple refreshes in quick succession
      const now = Date.now();
      if (now - lastRefreshRef.current < refreshInterval / 2) {
        return;
      }
      lastRefreshRef.current = now;
      
      // Call the server action to refresh the token
      const result = await refreshSession();
      
      if (result.success) {
        // Update the client-side session object
        await update();
        
        if (showNotifications) {
          toast.success("Sessão Atualizada", {
            description: "Sua sessão foi atualizada automaticamente.",
            duration: 3000,
          });
        }
      } else if (result.error && showNotifications) {
        toast.error("Aviso de Sessão", {
          description: "Sua sessão está prestes a expirar. Por favor, salve seu trabalho.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      if (showNotifications) {
        toast.error("Erro de Sessão", {
          description: "Houve um problema ao atualizar sua sessão.",
          duration: 5000,
        });
      }
    }
  }, [session, update, showNotifications, isIdle, refreshInterval]);

  // Set up activity tracking
  useEffect(() => {
    // List of events to track for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];
    
    // Add event listeners for all activity events
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Clean up event listeners
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [handleUserActivity]);
  
  // Set up idle detection and session refresh
  useEffect(() => {
    if (!session) return;
    
    // Function to check if user is idle
    const checkActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      if (timeSinceLastActivity >= idleTimeout) {
        setIsIdle(true);
      } else {
        setIsIdle(false);
      }
    };
    
    // Set up periodic activity checking
    const activityInterval = setInterval(checkActivity, activityCheckInterval);
    
    // Set up periodic session refresh
    const refreshSession = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only refresh if the user has been active recently
      if (timeSinceLastActivity < idleTimeout) {
        handleSessionRefresh();
      }
    };
    
    // Initial session refresh after a short delay
    const initialRefreshTimeout = setTimeout(refreshSession, 1000);
    
    // Set up interval for periodic session refresh
    const sessionInterval = setInterval(refreshSession, refreshInterval);
    
    // Clean up intervals
    return () => {
      clearInterval(activityInterval);
      clearInterval(sessionInterval);
      clearTimeout(initialRefreshTimeout);
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      if (refreshTimeoutIdRef.current) {
        clearTimeout(refreshTimeoutIdRef.current);
      }
    };
  }, [session, refreshInterval, idleTimeout, activityCheckInterval, handleSessionRefresh]);
  
  // This component doesn't render anything visible
  return null;
} 