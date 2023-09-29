import React, { useState, useEffect } from 'react';
import { Component } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useInitFbSDK } from '../hooks/fb-hook';
import Icon, { HeartOutlined, CommentOutlined, ShareAltOutlined, HeartFilled } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { Button, Modal, Select, Badge, Space, Input, Form, Card, List, Avatar } from 'antd';

const { TextArea } = Input;
const { Meta } = Card;
const { Option } = Select;
function PostPage() {
    const isFbSDKInitialized = useInitFbSDK();
    const [pages, setPages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    let tempsFBPosts = [];
    const [chosenPages, setChosenPages] = useState([]);
    let message = '';
    const [confirmLoading, setConfirmLoading] = useState(false);
    const showModal = () => {
        console.log('chosenPages', chosenPages);
        setOpen(true);
    };
    const handleOk = async () => {
        setConfirmLoading(true);
        console.log(chosenPages);
        let pendingPosts = chosenPages.length;
        chosenPages.forEach((pageIndex) => {
            console.log(pages[pageIndex]);
            window.FB?.api(
                `/${pages[pageIndex].id}/feed?message=${message}&access_token=${pages[pageIndex].access_token}`,
                'POST',
                {},
                function (response) {
                    console.log('page: ', pages[pageIndex], 'message: ', message);
                    pendingPosts--;
                    if (pendingPosts === 0) {
                        setOpen(false);
                        setConfirmLoading(false);
                        setPages([...pages]);
                    }
                },
            );
        });
    };
    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };
    useEffect(() => {
        // if (isFbSDKInitialized || window.FB) {
        window.FB?.getLoginStatus((response) => {
            if (response.status === 'connected') {
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse?.accessToken;
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
                        // Insert your code here
                        localStorage.setItem('fbUserAccessToken', response.access_token);
                    },
                );
            } else if (response.status === 'not_authorized') {
                // the user is logged in to Facebook,
                // but has not authenticated your app
            } else {
                const accessToken = localStorage.getItem('fbUserAccessToken');
            }
        });
        window.FB?.api('/me/accounts?fields=picture,name,access_token', 'GET', {}, function (response) {
            console.log('pages:', response.data);
            setPages(response.data);
        });
        // }
    }, [window.FB, isFbSDKInitialized]);
    useEffect(() => {
        getFBPosts(updateFBPosts);
    }, [pages]);
    const updateFBPosts = (newPosts) => {
        setPosts(
            [...posts, ...newPosts]
                .filter((item) => item.message || item.full_picture)
                .sort((a, b) => {
                    if (a.created_time < b.created_time) return 1;
                    if (a.created_time > b.created_time) return -1;
                    return 0;
                }),
        );
    };
    const getFBPosts = (callback) => {
        let tempsFBPosts = [];
        for (let i = 0; i < pages?.length; i++) {
            const page = pages[i];
            window.FB.api(
                `/${page.id}/feed?fields=shares,comments.summary(true),created_time,likes.summary(true),message,actions,story,message_tags,full_picture,from&access_token=${page.access_token}`,
                async function (response) {
                    if (response && !response.error) {
                        console.log(response);
                        tempsFBPosts = [...tempsFBPosts, ...response.data.map((data) => ({ ...data, page }))];
                        while (response.paging.next) {
                            response = await fetch(response.paging.next)
                                .then((response) => response.json())
                                .then((responseJson) => {
                                    return responseJson;
                                });
                            console.log(response);
                            tempsFBPosts = [...tempsFBPosts, ...response.data.map((data) => ({ ...data, page }))];
                        }
                        callback(tempsFBPosts);
                    }
                },
            );
        }
    };
    const handleChange = (value) => {
        setChosenPages(value);
    };
    const handleMessageChange = (event) => {
        message = event.target?.value;
    };
    const likePost = (post) => {
        console.log(post);
        console.log(post.page.access_token);
        post.likes.summary.total_count++;
        post.likes.summary.has_liked = true;
        console.log(posts);
        setPosts([...posts]);
        window.FB?.api(
            `/${post.id}/likes`,
            'POST',
            {
                access_token: post.page.access_token,
            },
            function (response) {
                if (response && !response.error) {
                    /* handle the result */
                }
            },
        );
    };
    const unlikePost = (post) => {
        console.log('unlike');
        post.likes.summary.total_count--;
        post.likes.summary.has_liked = false;
        console.log(posts);
        setPosts([...posts]);
        window.FB?.api(
            `/${post.id}/likes`,
            'DELETE',
            {
                access_token: post.page.access_token,
            },
            function (response) {
                if (response && !response.error) {
                    /* handle the result */
                }
            },
        );
    };
    return (
        <>
            <Button onClick={showModal} type="primary">
                Create a post
            </Button>
            <Modal title="New Post" open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>
                <Space
                    style={{
                        width: '100%',
                    }}
                    direction="vertical"
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="select pages..."
                        defaultValue={[]}
                        onChange={handleChange}
                        optionLabelProp="label"
                    >
                        {pages?.map((page, index) => (
                            <Option
                                key={index}
                                value={index}
                                label={
                                    <Space>
                                        <Avatar
                                            src={page?.picture?.data?.url}
                                            style={{ marginRight: 0, height: 20, width: 20 }}
                                        ></Avatar>
                                        {page.name}
                                    </Space>
                                }
                            >
                                <Space>
                                    <Avatar src={page?.picture?.data?.url} style={{ marginRight: 0 }}></Avatar>
                                    {page.name}
                                </Space>
                            </Option>
                        ))}
                    </Select>
                    <TextArea onChange={handleMessageChange} rows={6} placeholder="Say somthings....." />
                </Space>
            </Modal>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={posts}
                renderItem={(item) => {
                    if (item.message || item.full_picture)
                        return (
                            <List.Item key={item.id}>
                                <Card
                                    title={
                                        <>
                                            <Avatar
                                                src={item.page?.picture?.data?.url}
                                                style={{ marginRight: 20 }}
                                            ></Avatar>
                                            {item.from?.name}
                                            <span style={{ fontWeight: 400, marginLeft: 10, color: 'grey' }}>
                                                {item.story}
                                            </span>
                                        </>
                                    }
                                    extra={<a href={item.actions?.[0]?.link}>See</a>}
                                    hoverable
                                    style={{ width: 500, margin: 'auto' }}
                                    actions={[
                                        <Badge size="small" count={item.likes?.summary?.total_count}>
                                            {item.likes?.summary?.has_liked ? (
                                                <HeartFilled
                                                    onClick={() => {
                                                        unlikePost(item);
                                                    }}
                                                    style={{ fontSize: '20px', color: 'red' }}
                                                />
                                            ) : (
                                                <HeartOutlined
                                                    onClick={() => {
                                                        likePost(item);
                                                    }}
                                                    style={{ fontSize: '20px' }}
                                                />
                                            )}
                                        </Badge>,
                                        <Badge size="small" count={item.comments?.summary?.total_count}>
                                            <CommentOutlined style={{ fontSize: '20px' }} />
                                        </Badge>,
                                        <Badge size="small" count={item.shares?.count}>
                                            <ShareAltOutlined style={{ fontSize: '20px' }} />{' '}
                                        </Badge>,
                                    ]}
                                >
                                    {item.message}
                                    {item.full_picture ? (
                                        <img
                                            style={{ width: '100%', marginTop: 10 }}
                                            alt="example"
                                            src={item.full_picture}
                                        />
                                    ) : null}
                                </Card>
                            </List.Item>
                        );
                    return null;
                }}
            />
        </>
    );
}
export default PostPage;
