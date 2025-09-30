import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Github, ExternalLink, CheckCircle2, Clock, XCircle, Activity, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TransactionCard } from "@/components/TransactionCard";
import { StatsCard } from "@/components/StatsCard";

interface Deployment {
  id: number;
  project_name: string;
  status: "deployed" | "deploying" | "failed";
  url: string;
  contract_addresses: Record<string, string>;
  deployment_type: "dapp" | "static";
  timestamp: string;
  github_repo: string;
  github_branch: string;
  tx_hash: string;
  gas_used: string;
}

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'github' | 'health' | 'transaction'>('github');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <nav className="flex flex-col gap-4 flex-1">
          <button
            className={`text-left hover:text-primary transition-colors ${activeSection === 'github' ? 'font-bold text-primary' : ''}`}
            onClick={() => setActiveSection('github')}
          >
            Github
          </button>
          <button
            className={`text-left hover:text-primary transition-colors ${activeSection === 'health' ? 'font-bold text-primary' : ''}`}
            onClick={() => setActiveSection('health')}
          >
            Health
          </button>
          <button
            className={`text-left hover:text-primary transition-colors ${activeSection === 'transaction' ? 'font-bold text-primary' : ''}`}
            onClick={() => setActiveSection('transaction')}
          >
            Transaction
          </button>
        </nav>
        <button
          className="mt-8 py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      
      {/* Main Area */}
      <main className="flex-1 bg-background p-8 overflow-y-auto">
        {activeSection === 'github' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Deployments</h1>
            <div className="overflow-x-auto">
              <DeploymentsTable />
            </div>
          </>
        )}
        {activeSection === 'health' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Health</h1>
            <div className="text-muted-foreground">Monitor the health of your deployments and services here.</div>
          </>
        )}
        {activeSection === 'transaction' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Transaction</h1>
            <div className="text-muted-foreground">View and manage your deployment transactions here.</div>
          </>
        )}
      </main>
    </div>
  );
};

function DeploymentsTable() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    // Mock data for demo instead of external API
    setTimeout(() => {
      setDeployments([
        {
          id: 1,
          project_name: "DeFi Dashboard",
          status: "deployed",
          deployment_type: "dapp",
          blockchain_network: "sepolia",
          gas_used: "2,456,789",
          error_message: "",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          project_name: "NFT Marketplace",
          status: "deployed",
          deployment_type: "dapp",
          blockchain_network: "sepolia",
          gas_used: "3,123,456",
          error_message: "",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          project_name: "DAO Governance",
          status: "pending",
          deployment_type: "dapp",
          blockchain_network: "sepolia",
          gas_used: "",
          error_message: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          project_name: "Token Swap",
          status: "failed",
          deployment_type: "dapp",
          blockchain_network: "sepolia",
          gas_used: "",
          error_message: "Gas estimation failed",
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!deployments.length) return <div className="p-4">No deployments found.</div>;

  return (
    <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
      <thead>
        <tr>
          <th className="px-4 py-2 border-b">ID</th>
          <th className="px-4 py-2 border-b">Project Name</th>
          <th className="px-4 py-2 border-b">Status</th>
          <th className="px-4 py-2 border-b">Type</th>
          <th className="px-4 py-2 border-b">Network</th>
          <th className="px-4 py-2 border-b">Gas Used</th>
          <th className="px-4 py-2 border-b">Error Message</th>
          <th className="px-4 py-2 border-b">Created At</th>
          <th className="px-4 py-2 border-b">Updated At</th>
        </tr>
      </thead>
      <tbody>
        {deployments.map((item) => (
          <tr key={item.id} className="border-b last:border-b-0">
            <td className="px-4 py-2">{item.id}</td>
            <td className="px-4 py-2">{item.project_name}</td>
            <td className="px-4 py-2 capitalize">
              <span className={
                item.status === 'pending' ? 'text-yellow-500' :
                item.status === 'failed' ? 'text-red-500' :
                'text-green-500'
              }>
                {item.status}
              </span>
            </td>
            <td className="px-4 py-2">{item.deployment_type}</td>
            <td className="px-4 py-2">{item.blockchain_network}</td>
            <td className="px-4 py-2">{item.gas_used}</td>
            <td className="px-4 py-2 text-xs max-w-xs truncate" title={item.error_message}>{item.error_message}</td>
            <td className="px-4 py-2 text-xs">{new Date(item.created_at).toLocaleString()}</td>
            <td className="px-4 py-2 text-xs">{new Date(item.updated_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Dashboard;