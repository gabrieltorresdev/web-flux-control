"use client";

import { useEffect, useState } from "react";
import { UserStatus } from "@/services/user-service";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { checkUserStatus } from "@/app/actions/user";
import { motion, AnimatePresence } from "framer-motion";

const loadingMessages = [
  "Preparando seus relatórios financeiros...",
  "Configurando suas categorias personalizadas...",
  "Ajustando as configurações de segurança...",
  "Polindo os gráficos e dashboards...",
  "Organizando suas transações futuras...",
  "Calibrando a máquina do tempo financeira...",
  "Alimentando os hamsters que fazem as contas...",
  "Contando cada centavo com carinho...",
  "Ensinando matemática para a calculadora...",
  "Plantando sementes de prosperidade...",
];

type GameChoice = "rock" | "paper" | "scissors";
type GameResult = "win" | "lose" | "draw" | null;

export function EnvironmentPreparation() {
  const [status, setStatus] = useState<UserStatus>("pending");
  const [currentMessage, setCurrentMessage] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<GameChoice | null>(null);
  const [computerChoice, setComputerChoice] = useState<GameChoice | null>(null);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const gameTimer = setTimeout(() => {
      setShowGame(true);
    }, 10000);
    return () => clearTimeout(gameTimer);
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const currentStatus = await checkUserStatus();
        setStatus(currentStatus);

        if (currentStatus === "completed") {
          router.push("/dashboard");
          return;
        }

        if (currentStatus === "pending") {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setStatus("failed");
      }
    };

    checkStatus();
  }, [router]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const playGame = (choice: GameChoice) => {
    const choices: GameChoice[] = ["rock", "paper", "scissors"];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(choice);
    setComputerChoice(computerChoice);

    if (choice === computerChoice) {
      setGameResult("draw");
    } else if (
      (choice === "rock" && computerChoice === "scissors") ||
      (choice === "paper" && computerChoice === "rock") ||
      (choice === "scissors" && computerChoice === "paper")
    ) {
      setGameResult("win");
      setPlayerScore((prev) => prev + 1);
    } else {
      setGameResult("lose");
      setComputerScore((prev) => prev + 1);
    }
  };

  const getGameResultMessage = () => {
    if (!gameResult) return null;
    if (gameResult === "draw") return "Empate! 🤝";
    if (gameResult === "win") return "Você venceu! 🎉";
    return "Computador venceu! 🤖";
  };

  const getChoiceEmoji = (choice: GameChoice | null) => {
    if (!choice) return "";
    return {
      rock: "🪨",
      paper: "📄",
      scissors: "✂️",
    }[choice];
  };

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold text-destructive">
            Ops! Algo deu errado
          </h1>
          <p className="text-sm text-muted-foreground">
            Não foi possível preparar seu ambiente. Por favor, entre em contato
            com o suporte.
          </p>
          <Button
            variant="outline"
            onClick={handleLogout}
            size="sm"
            className="mt-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        </motion.div>
        <div className="space-y-3">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl font-bold"
          >
            Preparando seu ambiente
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-muted-foreground h-8 flex items-center justify-center"
          >
            {loadingMessages[currentMessage]}
          </motion.p>
        </div>

        <AnimatePresence>
          {showGame && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent h-8 -top-8" />
              <div className="border rounded-lg p-4 bg-card shadow-lg space-y-4">
                <div>
                  <h2 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                    Que tal um joguinho enquanto espera?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pedra, Papel e Tesoura
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 bg-muted/50 py-1.5 px-3 rounded-full text-xs">
                  <div className="font-medium">
                    Você <span className="text-primary">{playerScore}</span>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div className="font-medium">
                    <span className="text-primary">{computerScore}</span> PC
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => playGame("rock")}
                      size="sm"
                      className="w-full aspect-square rounded-lg hover:bg-primary/5 hover:border-primary/50"
                    >
                      <span className="text-2xl">🪨</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => playGame("paper")}
                      size="sm"
                      className="w-full aspect-square rounded-lg hover:bg-primary/5 hover:border-primary/50"
                    >
                      <span className="text-2xl">📄</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => playGame("scissors")}
                      size="sm"
                      className="w-full aspect-square rounded-lg hover:bg-primary/5 hover:border-primary/50"
                    >
                      <span className="text-2xl">✂️</span>
                    </Button>
                  </motion.div>
                </div>

                {playerChoice && computerChoice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-center items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Você
                        </div>
                        <div className="text-2xl bg-muted/30 w-12 h-12 rounded-lg flex items-center justify-center">
                          {getChoiceEmoji(playerChoice)}
                        </div>
                      </div>
                      <div className="text-base font-semibold text-muted-foreground">
                        vs
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          PC
                        </div>
                        <div className="text-2xl bg-muted/30 w-12 h-12 rounded-lg flex items-center justify-center">
                          {getChoiceEmoji(computerChoice)}
                        </div>
                      </div>
                    </div>
                    <div className="text-base font-medium text-primary">
                      {getGameResultMessage()}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
