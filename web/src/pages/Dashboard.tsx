import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileCode,
  CreditCard,
  Settings,
  LogOut,
  Download,
  ChevronRight,
  Plus,
  Copy,
  ExternalLink,
  Rocket,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Deploy from "@/assets/Deploy.svg";
import mike from "@/assets/mike.jpeg";
import { useNavigate } from "react-router-dom";

export default function DeployChainDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploymentsLoading, setDeploymentsLoading] = useState(true);
  const [activePage, setActivePage] = useState("summary");
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [deploymentForm, setDeploymentForm] = useState({
    repo_url: "",
    branch: "main",
    project_name: "",
  });
  const [isDeploying, setIsDeploying] = useState(false);

  const fetchDeployments = async () => {
    try {
      const response = await fetch(
        "http://localhost:18080/api/deployments",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setDeployments(data);
      setDeploymentsLoading(false);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      setDeploymentsLoading(false);
    }
  };

  const [walletNotifications] = useState([
    {
      id: 1,
      message: "New deposit of 2.5 ETH received",
      time: "5 minutes ago",
      type: "success",
    },
    {
      id: 2,
      message: "Gas price alert: Currently 45 gwei",
      time: "1 hour ago",
      type: "warning",
    },
    {
      id: 3,
      message: "Contract deployment successful",
      time: "3 hours ago",
      type: "success",
    },
  ]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=10"
        );
        const data = await response.json();

        const txData = data.map((item, idx) => ({
          id: `0x${item.id.toString().padStart(4, "0")}...${Math.random()
            .toString(16)
            .substr(2, 4)}`,
          type: ["Token Deploy", "NFT Mint", "Contract Deploy"][idx % 3],
          amount: (Math.random() * 10).toFixed(3),
          network: ["Ethereum", "Polygon", "Solana"][idx % 3],
          status: Math.random() > 0.2 ? "Success" : "Pending",
          time: `${Math.floor(Math.random() * 60)}m ago`,
        }));

        setTransactions(txData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
    fetchDeployments();
    const interval = setInterval(() => {
      fetchTransactions();
      fetchDeployments();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    console.log("Input change:", field, value); // Debug log
    setDeploymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Alternative individual handlers
  const handleRepoUrlChange = (e) => {
    setDeploymentForm((prev) => ({ ...prev, repo_url: e.target.value }));
  };

  const handleBranchChange = (e) => {
    setDeploymentForm((prev) => ({ ...prev, branch: e.target.value }));
  };

  const handleProjectNameChange = (e) => {
    setDeploymentForm((prev) => ({ ...prev, project_name: e.target.value }));
  };

  const handleDeploymentSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", deploymentForm); // Debug log
    setIsDeploying(true);

    try {
      const response = await fetch(
        "http://localhost:18080/api/deploy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deploymentForm),
        }
      );

      if (response.ok) {
        // Reset form and close modal
        setDeploymentForm({
          repo_url: "",
          branch: "main",
          project_name: "",
        });
        setShowDeploymentModal(false);
        // Refresh deployments list
        fetchDeployments();
      } else {
        console.error("Failed to create deployment");
      }
    } catch (error) {
      console.error("Error creating deployment:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  const deploymentData = [
    { date: "25 Wed", value: 32 },
    { date: "04 Thu", value: 45 },
    { date: "06 Fri", value: 41 },
    { date: "08 Sat", value: 52 },
    { date: "07 Sun", value: 62 },
    { date: "08 Mon", value: 55 },
    { date: "09 Tue", value: 42 },
    { date: "10 Wed", value: 38 },
    { date: "11 Thu", value: 50 },
    { date: "12 Fri", value: 48 },
    { date: "13 Sat", value: 35 },
    { date: "14 Sun", value: 28 },
    { date: "15 Mon", value: 42 },
    { date: "16 Tue", value: 58 },
  ];

  const networkData = [
    { name: "Eth", value: 45, color: "#1e293b" },
    { name: "Polygon", value: 30, color: "#94a3b8" },
    { name: "Solana", value: 25, color: "#cbd5e1" },
  ];

  const SummaryPage = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, Mike
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <FileCode size={20} />
            </div>
            <div>
              <p className="text-sm opacity-90">Token orders</p>
              <div className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                <span>24 this week</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            <span className="text-3xl font-bold">$9,328.55</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/30 rounded-full"></div>
            <div>
              <p className="text-sm opacity-90">Users</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp size={14} />
                <span>+12.7%</span>
                <span className="opacity-75">24 this week</span>
              </div>
            </div>
          </div>
          <span className="text-4xl font-bold">12,302</span>
        </div>

        <div className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/30 rounded-full"></div>
            <div>
              <p className="text-sm opacity-90">Active contracts</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown size={14} />
                <span>-12.7%</span>
                <span className="opacity-75">213</span>
              </div>
            </div>
          </div>
          <span className="text-4xl font-bold">963</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Deployment trends
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Export data
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 rounded">
                Last 14 Days
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={deploymentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1e293b"
                strokeWidth={2}
                dot={{ fill: "#1e293b", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Networks</h3>
          <div className="flex justify-center mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={networkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {networkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {networkData.map((network, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full`}
                    style={{ backgroundColor: network.color }}
                  ></div>
                  <span className="text-gray-800 font-medium">
                    {network.name}
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const WalletPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Wallets</h2>
        <button className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          <Plus size={20} />
          <span>Add Wallet</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Bell className="text-blue-600 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2">
              Recent Notifications
            </h3>
            <div className="space-y-2">
              {walletNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between py-2 border-b border-blue-100 last:border-0"
                >
                  <div>
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      notif.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {notif.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[
          {
            name: "Primary Wallet",
            address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            balance: "12.45 ETH",
            usd: "$23,450",
          },
          {
            name: "Trading Wallet",
            address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            balance: "5.23 ETH",
            usd: "$9,876",
          },
        ].map((wallet, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {wallet.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {wallet.balance}
              </p>
              <p className="text-gray-600">{wallet.usd}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
                Send
              </button>
              <button className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Receive
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const ContractsPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Smart Contracts</h2>
        <button className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          <Plus size={20} />
          <span>Deploy Contract</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 text-sm font-semibold text-gray-600">
          <div>Contract Name</div>
          <div>Type</div>
          <div>Network</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {[
          {
            name: "TokenSwap V2",
            type: "DeFi",
            network: "Ethereum",
            status: "Active",
          },
          {
            name: "NFT Marketplace",
            type: "NFT",
            network: "Polygon",
            status: "Active",
          },
          {
            name: "Staking Pool",
            type: "DeFi",
            network: "BSC",
            status: "Paused",
          },
          {
            name: "GameToken",
            type: "ERC-20",
            network: "Ethereum",
            status: "Active",
          },
        ].map((contract, idx) => (
          <div
            key={idx}
            className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="font-semibold text-gray-800">{contract.name}</div>
            <div className="text-gray-600">{contract.type}</div>
            <div className="text-gray-600">{contract.network}</div>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  contract.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {contract.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-700">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const TransactionsPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Recent Transactions (Live API)
        </h2>
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <Download size={16} />
          <span className="text-sm font-medium">Export</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading transactions...
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === "Token Deploy"
                        ? "bg-blue-100"
                        : tx.type === "NFT Mint"
                        ? "bg-purple-100"
                        : "bg-green-100"
                    }`}
                  >
                    {tx.type === "Token Deploy"
                      ? "🪙"
                      : tx.type === "NFT Mint"
                      ? ""
                      : ""}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{tx.type}</p>
                    <p className="text-sm text-gray-500">{tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{tx.amount} ETH</p>
                  <p className="text-sm text-gray-500">{tx.network}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === "Success"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {tx.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const DeploymentModal = () => {
    if (!showDeploymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">New Deployment</h3>
            <button
              onClick={() => setShowDeploymentModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleDeploymentSubmit} className="space-y-4">
            {/* Debug info */}
            {/* <div className="text-xs text-gray-500 mb-2">
              Current form state: {JSON.stringify(deploymentForm)}
            </div> */}
            <div>
              <label
                htmlFor="repo_url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Repository URL *
              </label>
              <input
                type="url"
                id="repo_url"
                value={deploymentForm.repo_url}
                onChange={handleRepoUrlChange}
                placeholder="https://github.com/mt0.dev/repo.git"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Branch *
              </label>
              <input
                type="text"
                id="branch"
                value={deploymentForm.branch}
                onChange={handleBranchChange}
                placeholder="main"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="project_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="project_name"
                value={deploymentForm.project_name}
                onChange={handleProjectNameChange}
                placeholder="my-awesome-dapp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeploymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeploying}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  isDeploying
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
              >
                {isDeploying ? "Deploying..." : "Deploy"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeploymentsPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Deployments (Live API)
        </h2>
        <button
          onClick={() => setShowDeploymentModal(true)}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Plus size={20} />
          <span>New Deployment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        {deploymentsLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading deployments...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <div>Project Name</div>
              <div>Repository URL</div>
              <div>Branch</div>
              <div>Status</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            {deployments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No deployments found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {deployments.map((deployment, idx) => (
                  <div
                    key={deployment.id || idx}
                    className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">
                      {deployment.project_name ||
                        deployment.projectName ||
                        "Unknown"}
                    </div>
                    <div className="text-gray-600 truncate">
                      {deployment.repo_url || deployment.repoUrl || "N/A"}
                    </div>
                    <div className="text-gray-600">
                      {deployment.branch || "main"}
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          deployment.status === "completed" ||
                          deployment.status === "success"
                            ? "bg-green-100 text-green-700"
                            : deployment.status === "failed" ||
                              deployment.status === "error"
                            ? "bg-red-100 text-red-700"
                            : deployment.status === "in_progress" ||
                              deployment.status === "deploying"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {deployment.status || "pending"}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {deployment.created_at
                        ? new Date(deployment.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 p-1 rounded">
                        <ExternalLink size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 p-1 rounded">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <DeploymentModal />
    </>
  );

  const SettingsPage = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Account Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                defaultValue="Mike Omondi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="mike@deploychain.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Email Notifications</span>
              <button className="w-12 h-6 bg-blue-900 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Dark Mode</span>
              <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Two-Factor Auth</span>
              <button className="w-12 h-6 bg-blue-900 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderPage = () => {
    switch (activePage) {
      case "summary":
        return <SummaryPage />;
      case "wallet":
        return <WalletPage />;
      case "contracts":
        return <ContractsPage />;
      case "deployments":
        return <DeploymentsPage />;
      case "transactions":
        return <TransactionsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <SummaryPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-gray-700 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-center">
            <div className="w-36 h-16 bg-none rounded-0 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src={Deploy}
                alt="DeployChain Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => setActivePage("summary")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[25px] mb-2 transition-all ${
              activePage === "summary"
                ? "bg-white/20 shadow-lg"
                : "hover:bg-white/10"
            }`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Summary</span>
          </button>

          <div className="my-6 border-t border-white/10"></div>

          {/* Temporarily commented out - keeping components intact
          <button 
            onClick={() => setActivePage('wallet')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[25px] mb-2 transition-all ${
              activePage === 'wallet' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
            }`}
          >
            <Wallet size={20} />
            <span className="font-medium">Wallet</span>
            <span className="ml-auto bg-blue-500 px-2 py-1 rounded-full text-xs">2</span>
          </button>

          <button 
            onClick={() => setActivePage('contracts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[25px] mb-2 transition-all ${
              activePage === 'contracts' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
            }`}
          >
            <FileCode size={20} />
            <span className="font-medium">Contracts</span>
          </button>
          */}

          <button
            onClick={() => setActivePage("deployments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[25px] mb-2 transition-all ${
              activePage === "deployments"
                ? "bg-white/20 shadow-lg"
                : "hover:bg-white/10"
            }`}
          >
            <Rocket size={20} />
            <span className="font-medium">Deployments</span>
          </button>

          {/* Temporarily commented out - keeping components intact
          <button 
            onClick={() => setActivePage('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[25px] mb-2 transition-all ${
              activePage === 'transactions' ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'
            }`}
          >
            <CreditCard size={20} />
            <span className="font-medium">Transactions</span>
          </button>
          */}

          <div className="my-6 border-t border-white/10"></div>

          <button
            onClick={() => setActivePage("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[25px] mb-2 transition-all ${
              activePage === "settings"
                ? "bg-white/20 shadow-lg"
                : "hover:bg-white/10"
            }`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-blue-200 hover:text-white transition-colors rounded-[25px] hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center ">
                DeployChain
              </h1>
              <p className="text-sm text-gray-500 z-45">
                Deployment made easy.
              </p>
            </div>
            <div className="flex items-center gap-4 ml-8">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search"
                className="outline-none text-gray-600 bg-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                3
              </span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500 ring-offset-2">
                <img
                  src={mike}
                  alt="Mike Omondi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Mike Omondi
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">{renderPage()}</div>
      </div>
    </div>
  );
}
