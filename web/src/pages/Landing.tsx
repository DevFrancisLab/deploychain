import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import DeployChainIcon from '@/components/DeployChainIcon';
import DeploymentCard from '@/components/DeploymentCard';
import { DeploymentPipelineCanvas } from '@/components/DeploymentPipelineCanvas';
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
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">DeployChain</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {['hero', 'problem', 'solution', 'features', 'demo', 'deployments', 'try-it'].map((section) => (
                <button
                  key={section}
                  onClick={() => smoothScrollTo(section)}
                  className="text-muted-foreground hover:text-primary transition-colors capitalize"
                >
                  {section.replace('-', ' ')}
                </button>
              ))}
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-hero py-2 px-4 text-sm flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center bg-hero-gradient text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <DeployChainIcon />
            <h1 className="text-5xl md:text-7xl font-bold mb-6">DeployChain</h1>
            <p className="text-2xl md:text-3xl mb-4 font-light">
              Vercel for Web3: Deploy dApps with One Git Push
            </p>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Smart contracts + frontend deployed seamlessly to Sepolia testnet.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => smoothScrollTo('try-it')}
                className="btn-hero"
              >
                Try It Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => smoothScrollTo('demo')}
                className="btn-outline"
              >
                Watch Demo
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
                className="card-problem"
              >
                <h3 className="text-xl font-semibold text-foreground mb-4">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
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
          <DeploymentPipelineCanvas />
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
                className="card-feature"
              >
                <h3 className="text-xl font-semibold text-primary mb-4">{feature.title}</h3>
                <p className="text-accent-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              See It in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Watch how DeployChain transforms your Web3 development workflow in just 30 seconds.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-full max-w-4xl aspect-video">
              <iframe
                className="w-full h-full rounded-xl shadow-web3"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="DeployChain Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deployments Section */}
      <section id="deployments" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Recent Deployments
            </h2>
          </motion.div>
          {loading ? (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-primary transition ease-in-out duration-150">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading deployments...
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {deployments.map((deployment, index) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Try It Section */}
      <section id="try-it" className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Try DeployChain Now</h2>
            <p className="text-xl max-w-3xl mx-auto mb-12 text-blue-100">
              Deploy your dApp in minutes. Access the dashboard to manage your deployments.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-12 py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-hover text-lg flex items-center gap-3 mx-auto"
            >
              <Activity className="h-6 w-6" />
              Go to Dashboard
            </motion.button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-blue-100">
              Contact: <a href="mailto:arivtechcenter@gmail.com" className="underline hover:text-white transition-colors">arivtechcenter@gmail.com</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              © 2025 DeployChain by ARIV TECH CENTER. Built for Nairobi Mini Hack.
            </p>
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