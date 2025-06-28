
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import OverviewTab from "@/components/OverviewTab";
import DepositWithdrawTab from "@/components/DepositWithdrawTab";
import TransactionHistory from "@/components/TransactionHistory";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "deposit-withdraw":
        return <DepositWithdrawTab />;
      case "transactions":
        return <TransactionHistory />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="h-screen overflow-hidden pt-16">
      <div className="container mx-auto px-4 py-4 h-full">
        <div className="flex gap-4 h-full">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 min-h-0">
            <div className="glass rounded-lg p-4 h-full overflow-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
