import logo from './logo.svg';
import './App.css';
import React, { useContext, createContext, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import PostPage from './pages/PostPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import { UploadOutlined, UserOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import AuthProvider, { useAuth, RequireAuth, RedirectLoged } from './AuthProvider';
const { Header, Content, Footer, Sider } = Layout;

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <RedirectLoged>
                            <LoginPage />
                        </RedirectLoged>
                    }
                />
            </Routes>
            <PageLayout>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <RequireAuth>
                                <PostPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <RequireAuth>
                                <AccountPage />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </PageLayout>
        </AuthProvider>
    );
}
function PageLayout({ children }) {
    const navigate = useNavigate();
    const {
        token: { colorBgContainer },
        theme: themeName,
    } = theme.useToken();
    const items = [
        {
            label: 'Post',
            key: '/',
            icon: <PlayCircleOutlined />,
        },
        {
            label: 'Account',
            key: '/account',
            icon: <UserOutlined />,
        },
        {
            label: 'Logout',
            key: 'logout',
            icon: <UserOutlined />,
        },
    ];
    let auth = useAuth();
    return (
        <>
            <Header
                title="asd"
                style={{
                    padding: 0,
                    background: colorBgContainer,
                }}
            />
            <Layout theme="light">
                <Sider
                    theme="light"
                    breakpoint="lg"
                    collapsedWidth="0"
                    onBreakpoint={(broken) => {}}
                    onCollapse={(collapsed, type) => {}}
                >
                    <div className="demo-logo-vertical" />
                    <Menu
                        theme="light"
                        onClick={({ key }) => {
                            if (key === 'logout') {
                                auth.signout(() => navigate('/login'));
                            } else navigate(key);
                        }}
                        mode="inline"
                        items={items}
                    />
                </Sider>
                <Layout>
                    <Content
                        style={{
                            margin: '24px 16px 0',
                        }}
                    >
                        <div
                            style={{
                                padding: 24,
                                minHeight: '500px',
                                height: '100%',
                                background: colorBgContainer,
                            }}
                        >
                            {children}
                        </div>
                    </Content>
                    <Footer
                        style={{
                            textAlign: 'center',
                        }}
                    ></Footer>
                </Layout>
            </Layout>
        </>
    );
}

function AuthStatus() {
    let auth = useAuth();
    let navigate = useNavigate();

    if (!auth.user) {
        return <p>You are not logged in.</p>;
    }

    return (
        <p>
            Welcome {auth.user}!{' '}
            <button
                onClick={() => {
                    auth.signout(() => navigate('/'));
                }}
            >
                Sign out
            </button>
        </p>
    );
}

export default App;
