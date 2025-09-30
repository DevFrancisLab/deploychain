import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import DeployChainIcon from '@/components/DeployChainIcon';
import DeploymentCard from '@/components/DeploymentCard';
import deploymentPipeline from '@/assets/deployment-pipeline.jpg';

interface Deployment {
  id: number;
  project_name: string;
  status: 'deployed' | 'deploying' | 'failed';
  url: string;
  contract_addresses: { [key: string]: string };
  deployment_type: 'dapp' | 'static';
}

const Landing = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data for deployments
  const mockDeployments: Deployment[] = [
    {
      id: 1,
      project_name: "Test dApp",
      status: "deployed",
      url: "https://app-1.deploychain.locci.cloud",
      contract_addresses: {
        "Greeter": "0x123abc456def789ghi012jkl345mno678pqr901st",
        "Token": "0x987zyx654wvu321tsr098qpo765nml432kji109hg"
      },
      deployment_type: "dapp"
    },
    {
      id: 2,
      project_name: "Portfolio Site",
      status: "deployed",
      url: "https://portfolio.deploychain.locci.cloud",
      contract_addresses: {},
      deployment_type: "static"
    },
    {
      id: 3,
      project_name: "NFT Marketplace",
      status: "deploying",
      url: "https://nft-marketplace.deploychain.locci.cloud",
      contract_addresses: {
        "NFTMarketplace": "0xabc123def456ghi789jkl012mno345pqr678stu901"
      },
      deployment_type: "dapp"
    }
  ];

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/deployments');
      if (response.ok) {
        const data = await response.json();
        setDeployments(data);
      } else {
        // Use mock data if API fails
        setDeployments(mockDeployments);
      }
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      setDeployments(mockDeployments);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    setDeploying(true);
    try {
      const projectName = repoUrl.split('/').pop()?.replace('.git', '') || 'Unknown';
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_url: repoUrl,
          branch: branch,
          project_name: projectName
        }),
      });

      if (response.ok) {
        toast({
          title: "Deployment Started!",
          description: `${projectName} is being deployed. Check the deployments section for updates.`,
        });
        setRepoUrl('');
        setBranch('main');
        // Refetch deployments after a short delay
        setTimeout(fetchDeployments, 1000);
      } else {
        throw new Error('Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      toast({
        title: "Deployment Failed",
        description: "There was an error starting your deployment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeploying(false);
    }
  };

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
  <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg border-b border-transparent"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                className="text-2xl font-bold text-white bg-transparent border-none outline-none cursor-pointer"
                style={{ background: 'none', padding: 0 }}
                onClick={() => smoothScrollTo('hero')}
                aria-label="Go to top / hero section"
              >
                DeployChain
              </button>
            </div>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => smoothScrollTo('problem')}
                className="text-white hover:text-primary transition-colors capitalize"
              >
                About
              </button>
              <button
                onClick={() => smoothScrollTo('features')}
                className="text-white hover:text-primary transition-colors capitalize"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="ml-2 px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-colors shadow"
                style={{ minWidth: '120px' }}
              >
                Try It Now
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-hero-gradient text-white pt-16 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 bg-black"
          style={{ backgroundColor: '#111', backgroundImage: 'none' }}
        >
          <source src="/Your%20paragraph%20text.mp4" type="video/mp4" />
        </video>
        {/* Overlay to prevent white blink */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ background: 'rgba(10,10,20,0.7)' }} />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <DeployChainIcon />
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6">DeployChain</h1>
            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-4 font-light">
              Vercel for Web3: Deploy dApps with One Git Push
            </p>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl mb-6 sm:mb-12 text-blue-100 max-w-3xl mx-auto">
              Smart contracts + frontend deployed seamlessly to Sepolia testnet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="btn-hero w-full sm:w-auto"
              >
                Try It Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              The Web3 Deployment Problem
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fragmented Workflow",
                description: "Separate tools for frontend and smart contracts make deployment complex and error-prone."
              },
              {
                title: "Manual Setup",
                description: "Configuring RPCs, compiling Solidity, and managing deployments takes valuable development time."
              },
              {
                title: "Slow Iteration",
                description: "Hackathon time lost on deployment setup instead of building innovative features."
              }
            ].map((problem, index) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="card-problem p-6 rounded-xl shadow-md bg-white/80 dark:bg-gray-900/80 text-center flex flex-col items-center"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">{problem.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              DeployChain: One Push, Full dApp
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Our intelligent pipeline detects Web3 projects, compiles smart contracts, deploys to Sepolia testnet, 
              and provides you with a complete dashboard to track your dApp's performance.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img
              src={deploymentPipeline}
              alt="DeployChain deployment pipeline flowchart"
              className="w-full max-w-4xl rounded-xl shadow-web3"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Key Features</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "One-Push Deploy",
                description: "Complete dApp deployment in under 5 minutes with a single Git push."
              },
              {
                title: "Web3 Detection",
                description: "Automatically detects Web3 projects via contracts/ folder or hardhat.config.js."
              },
              {
                title: "MultiBaas Powered",
                description: "Seamless smart contract deployment to Sepolia testnet infrastructure."
              },
              {
                title: "Dashboard Insights",
                description: "Track deployments with direct Etherscan links and performance metrics."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-feature p-6 rounded-xl shadow-md bg-white/80 dark:bg-gray-900/80 text-center flex flex-col items-center"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-accent-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              © 2025 DeployChain</p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.multibaas.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white underline transition-colors"
              >
                MultiBaas
              </a>
              <a
                href="https://scaffoldeth.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white underline transition-colors"
              >
                Scaffold-ETH
              </a>
              <a
                href="https://sepolia.etherscan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white underline transition-colors"
              >
                Etherscan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;