import { motion } from 'framer-motion';

interface Deployment {
  id: number;
  project_name: string;
  status: 'deployed' | 'deploying' | 'failed';
  url: string;
  contract_addresses: { [key: string]: string };
  deployment_type: 'dapp' | 'static';
}

interface DeploymentCardProps {
  deployment: Deployment;
  index: number;
}

const DeploymentCard = ({ deployment, index }: DeploymentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'dapp' 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-secondary text-secondary-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-deployment"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-foreground">
            {deployment.project_name}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(deployment.deployment_type)}`}>
            {deployment.deployment_type}
          </span>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(deployment.status)}`}>
          {deployment.status}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Live URL:</p>
          <a
            href={deployment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark underline break-all transition-colors"
          >
            {deployment.url}
          </a>
        </div>

        {Object.keys(deployment.contract_addresses).length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Smart Contracts:</p>
            <div className="space-y-2">
              {Object.entries(deployment.contract_addresses).map(([name, address]) => (
                <div key={name} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <span className="text-sm font-medium">{name}:</span>
                  <a
                    href={`https://sepolia.etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-primary hover:text-primary-dark underline break-all transition-colors"
                  >
                    {address}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DeploymentCard;