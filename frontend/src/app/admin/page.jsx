"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


/**
 * AdminPage component for displaying and managing admin-related data such as users, categories, models, conversations, and messages.
 *
 * Redirects unauthorized users and loads admin data from the backend.
 *
 * @component
 * @returns {JSX.Element} The rendered admin dashboard page.
 */
const AdminPage = () => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const router = useRouter();

  useEffect(() => {
    const guestMode = localStorage.getItem("isGuest") === "true";
    
    // If in guest mode, redirect to home
    if (guestMode) {
      router.push("/");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // First check if user is admin
    fetch("http://localhost:8000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to get user data");
        }
        return response.json();
      })
      .then((userData) => {
        if (!userData.is_admin) {
          // Not an admin, redirect to home
          router.push("/");
          return;
        }
        
        // User is admin, fetch table data
        return fetch("http://localhost:8000/admin/tables", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((response) => {
        if (!response) return; // This happens if user is not admin
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setTableData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <div className="error">No data available or access denied</div>
      </div>
    );
  }

  // Render appropriate table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "users":
        return (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tableData.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.is_admin ? "Yes" : "No"}</td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "categories":
        return (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {tableData.categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "models":
        return (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {tableData.models.map((model) => (
                <tr key={model.id}>
                  <td>{model.id}</td>
                  <td>{model.name}</td>
                  <td>{model.is_avail ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "conversations":
        return (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Model ID</th>
                <th>Category ID</th>
                <th>Title</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tableData.conversations.map((conv) => (
                <tr key={conv.id}>
                  <td>{conv.id}</td>
                  <td>{conv.user_id}</td>
                  <td>{conv.model_id}</td>
                  <td>{conv.category_id}</td>
                  <td>{conv.title}</td>
                  <td>{new Date(conv.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "messages":
        return (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Conversation ID</th>
                <th>Role</th>
                <th>Content</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tableData.messages.map((msg) => (
                <tr key={msg.id}>
                  <td>{msg.id}</td>
                  <td>{msg.conversation_id}</td>
                  <td>{msg.role}</td>
                  <td>{msg.content}</td>
                  <td>{new Date(msg.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return <div>Select a tab to view data</div>;
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={activeTab === "models" ? "active" : ""}
          onClick={() => setActiveTab("models")}
        >
          Models
        </button>
        <button
          className={activeTab === "conversations" ? "active" : ""}
          onClick={() => setActiveTab("conversations")}
        >
          Conversations
        </button>
        <button
          className={activeTab === "messages" ? "active" : ""}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
      </div>
      <div className="admin-table-container">{renderTable()}</div>
    </div>
  );
};

export default AdminPage;
