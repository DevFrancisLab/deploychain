import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricText, Circle, Rect, Line } from "fabric";
import { motion } from "framer-motion";

interface PipelineStep {
  id: number;
  title: string;
  description: string;
  status: 'waiting' | 'active' | 'completed';
  icon: string;
}

export const DeploymentPipelineCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: PipelineStep[] = [
    {
      id: 1,
      title: "GitHub Trigger",
      description: "Webhook/manual trigger detects push",
      status: 'waiting',
      icon: "📡"
    },
    {
      id: 2,
      title: "Dagger Pipeline", 
      description: "Clone, detect Web3, compile Solidity",
      status: 'waiting',
      icon: "⚙️"
    },
    {
      id: 3,
      title: "MultiBaas Deploy",
      description: "Deploy contracts to Sepolia, store addresses",
      status: 'waiting',
      icon: "🚀"
    },
    {
      id: 4,
      title: "Frontend Build",
      description: "Build & deploy to domain",
      status: 'waiting',
      icon: "🏗️"
    },
    {
      id: 5,
      title: "Dashboard Ready",
      description: "Status, URLs, Etherscan links",
      status: 'waiting',
      icon: "📊"
    }
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 400,
      backgroundColor: "hsl(var(--background))",
    });

    setFabricCanvas(canvas);
    drawPipeline(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const drawPipeline = (canvas: FabricCanvas) => {
    canvas.clear();
    canvas.backgroundColor = "hsl(var(--background))";

    const stepWidth = 140;
    const startX = 50;
    const centerY = 200;

    // Draw connecting lines
    for (let i = 0; i < steps.length - 1; i++) {
      const line = new Line(
        [startX + (i + 1) * stepWidth - 20, centerY, startX + (i + 1) * stepWidth + 40, centerY],
        {
          stroke: 'hsl(var(--muted-foreground))',
          strokeWidth: 2,
          strokeDashArray: [5, 5]
        }
      );
      canvas.add(line);
    }

    // Draw step nodes
    steps.forEach((step, index) => {
      const x = startX + index * stepWidth;
      const y = centerY;

      // Step circle
      const circle = new Circle({
        left: x,
        top: y - 25,
        radius: 25,
        fill: step.status === 'completed' ? 'hsl(var(--primary))' : 
              step.status === 'active' ? 'hsl(var(--secondary))' : 'hsl(var(--muted))',
        stroke: 'hsl(var(--border))',
        strokeWidth: 2,
        selectable: false
      });

      // Step number
      const stepNumber = new FabricText(step.id.toString(), {
        left: x - 8,
        top: y - 18,
        fontSize: 16,
        fill: step.status === 'waiting' ? 'hsl(var(--muted-foreground))' : 'white',
        fontFamily: 'Inter',
        selectable: false
      });

      // Step title
      const title = new FabricText(step.title, {
        left: x - 60,
        top: y + 40,
        fontSize: 12,
        fill: 'hsl(var(--foreground))',
        fontFamily: 'Inter',
        fontWeight: 'bold',
        textAlign: 'center',
        selectable: false,
        width: 120
      });

      // Step description
      const description = new FabricText(step.description, {
        left: x - 60,
        top: y + 60,
        fontSize: 10,
        fill: 'hsl(var(--muted-foreground))',
        fontFamily: 'Inter',
        textAlign: 'center',
        selectable: false,
        width: 120
      });

      // Step icon
      const icon = new FabricText(step.icon, {
        left: x - 10,
        top: y - 45,
        fontSize: 20,
        selectable: false
      });

      canvas.add(circle, stepNumber, title, description, icon);
    });

    canvas.renderAll();
  };

  const animateStep = (stepIndex: number) => {
    if (!fabricCanvas || stepIndex >= steps.length) return;

    const stepWidth = 140;
    const startX = 50;
    const centerY = 200;
    const x = startX + stepIndex * stepWidth;

    // Create animated progress indicator
    const progressCircle = new Circle({
      left: x,
      top: centerY - 25,
      radius: 30,
      fill: 'transparent',
      stroke: 'hsl(var(--primary))',
      strokeWidth: 3,
      strokeDashArray: [10, 5],
      selectable: false,
      opacity: 0.8
    });

    fabricCanvas.add(progressCircle);

    // Animate the progress circle
    const animateProgress = () => {
      const rotation = setInterval(() => {
        progressCircle.set('angle', (progressCircle.angle || 0) + 10);
        fabricCanvas.renderAll();
      }, 50);

      setTimeout(() => {
        clearInterval(rotation);
        fabricCanvas.remove(progressCircle);
        // Update step status and redraw
        steps[stepIndex].status = 'completed';
        if (stepIndex < steps.length - 1) {
          steps[stepIndex + 1].status = 'active';
        }
        drawPipeline(fabricCanvas);
      }, 1000);
    };

    animateProgress();
  };

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentStep(0);
    
    // Reset all steps
    steps.forEach((step, index) => {
      step.status = index === 0 ? 'active' : 'waiting';
    });
    
    if (fabricCanvas) {
      drawPipeline(fabricCanvas);
    }

    // Animate each step with delay
    steps.forEach((_, index) => {
      setTimeout(() => {
        animateStep(index);
        setCurrentStep(index + 1);
        
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
            setCurrentStep(0);
          }, 1500);
        }
      }, index * 1500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl shadow-web3 p-8"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Live Deployment Pipeline
        </h3>
        <p className="text-muted-foreground mb-4">
          Watch how DeployChain deploys your dApp in &lt;5 minutes
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startAnimation}
          disabled={isAnimating}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isAnimating 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isAnimating ? 'Deploying...' : 'Start Demo'}
        </motion.button>
      </div>

      <div className="flex justify-center mb-6">
        <canvas 
          ref={canvasRef} 
          className="border border-border rounded-lg max-w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0.5 }}
            animate={{ 
              opacity: step.status === 'active' ? 1 : 0.7,
              scale: step.status === 'active' ? 1.05 : 1
            }}
            className={`p-3 rounded-lg transition-colors ${
              step.status === 'completed' ? 'bg-primary/20 border-primary' :
              step.status === 'active' ? 'bg-secondary/20 border-secondary' :
              'bg-muted border-border'
            } border`}
          >
            <div className="text-2xl mb-1">{step.icon}</div>
            <div className="text-sm font-medium text-foreground">{step.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
            {step.status === 'completed' && (
              <div className="text-xs text-primary mt-1 font-medium">✓ Complete</div>
            )}
            {step.status === 'active' && (
              <div className="text-xs text-secondary mt-1 font-medium">⏳ Running</div>
            )}
          </motion.div>
        ))}
      </div>

      {isAnimating && (
        <div className="mt-6 text-center">
          <div className="text-sm text-muted-foreground">
            Estimated time remaining: {Math.max(0, (steps.length - currentStep) * 1.5).toFixed(1)} minutes
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};