import React from 'react';
import { Card, List, Avatar } from 'antd';
import { UserAddOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useInitFbSDK } from '../hooks/fb-hook';
import { useState, useEffect, useCallback } from 'react';
const { Meta } = Card;
function AccountPage() {
    const isFbSDKInitialized = useInitFbSDK();
    const [isLoginFB, setIsLoginFB] = useState(false);
    console.log(isFbSDKInitialized);
    // App state
    const [fbUserAccessToken, setFbUserAccessToken] = useState();

    // Logs in a Facebook user
    const loginFB = useCallback(() => {
        window.FB.login((response) => {
            console.log(response);
            localStorage.setItem('fbUserAccessToken', response.authResponse?.accessToken);
            setFbUserAccessToken(response.authResponse?.accessToken);
        });
    }, []);

    useEffect(() => {
        if (isFbSDKInitialized || window.FB) {
            window.FB.getLoginStatus((response) => {
                if (response.status === 'connected') {
                    var uid = response.authResponse.userID;
                    var accessToken = response.authResponse?.accessToken;
                    setIsLoginFB(true);
                    window.FB.api(
                        '/oauth/access_token',
                        'GET',
                        {
                            grant_type: 'fb_exchange_token',
                            client_id: ' 24044447041837444',
                            client_secret: '96044cf44c83c8a211bda8f221a7422e',
                            fb_exchange_token: accessToken,
                        },
                        function (response) {
                            console.log(response);
                            // Insert your code here
                            console.log(response.access_token);
                            localStorage.setItem('fbUserAccessToken', response.access_token);
                        },
                    );
                } else if (response.status === 'not_authorized') {
                    // the user is logged in to Facebook,
                    // but has not authenticated your app
                } else {
                    const accessToken = localStorage.getItem('fbUserAccessToken');
                    setFbUserAccessToken(accessToken);
                }
            });
        }
    }, [isFbSDKInitialized, fbUserAccessToken]);

    const data = [
        {
            title: 'Facebook',
            description: 'Manage facebook pages',
            avatar: './facebook.jpg',
            onClick: loginFB,
            isLogin: isLoginFB,
        },
        {
            title: 'Instagram',
            description: 'Manage instagram profiles, posts...',
            avatar: './instagram.jpeg',
            isLogin: isLoginFB,
        },
        {
            title: 'Twitter',
            description: 'Manage twiter accounts and feeds',
            avatar: './x.jpeg',
        },
    ];
    return (
        <List
            grid={{ gutter: 16 }}
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <Card
                        style={{ width: '300px' }}
                        cover={
                            <img
                                alt="example"
                                style={{ height: '200px', objectFit: 'cover' }}
                                src={item.avatar ?? './facebook.jpg'}
                            />
                        }
                        actions={[item.isLogin ? <div>Loged in</div> : <UserAddOutlined onClick={item.onClick} />]}
                    >
                        <Meta title={item.title} description={item.description} />
                    </Card>
                </List.Item>
            )}
        />
    );
}
export default AccountPage;
