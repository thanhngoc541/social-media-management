import React, { useState, useEffect } from 'react';
import { Component } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useInitFbSDK } from '../hooks/fb-hook';
import Icon, {
    HeartOutlined,
    CommentOutlined,
    ShareAltOutlined,
    HeartFilled,
    FacebookFilled,
    InstagramFilled,
} from '@ant-design/icons';
import { FloatButton } from 'antd';
import { Button, Modal, Select, Badge, Space, Input, Form, Card, List, Avatar } from 'antd';
import * as filestack from 'filestack-js';
const client = filestack.init('AYFn8jBpQO1LieThXVOQqz');
const { TextArea } = Input;
const { Meta } = Card;
const { Option } = Select;
function PostPage() {
    const isFbSDKInitialized = useInitFbSDK();
    const [pages, setPages] = useState([]);
    const [insPages, setInsPages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [file, setFile] = useState(null);
    const [open, setOpen] = useState(false);
    let tempsFBPosts = [];
    const [chosenPages, setChosenPages] = useState([]);
    const [chosenFilter, setchosenFilter] = useState([]);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    console.log('fbpages:', pages);
    console.log('insPage:', insPages);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const showModal = () => {
        console.log('chosenPages', chosenPages);
        setOpen(true);
    };
    const handleOk = async () => {
        const facebookChosenPages = chosenPages
            .filter((page) => page.startsWith('facebook'))
            .map((page) => 1 * page.split(',')[1]);
        console.log(facebookChosenPages);
        const insChosenPages = chosenPages
            .filter((page) => page.startsWith('instagram'))
            .map((page) => 1 * page.split(',')[1]);
        console.log(insChosenPages);
        let fileRes = null;
        if (!!file) {
            setConfirmLoading(true);
            fileRes = await client?.upload(file);
            console.log(fileRes);
        } else {
            if (insChosenPages.length > 0) {
                setErrorMessage('An instagram post should have an image');
                return;
            }
            setConfirmLoading(true);
        }
        console.log('set loading');

        setErrorMessage(null);

        const pre = !!fileRes?.url ? `photos?url=${fileRes.url}&` : 'feed?';
        let pendingPosts = chosenPages.length;
        insChosenPages.forEach(async (pageIndex) => {
            console.log('insChosenPages', insChosenPages);
            console.log('index', pageIndex);
            console.log('id', insChosenPages[pageIndex].id);
            window.FB?.api(
                `/${insPages[pageIndex].id}/media?image_url=${fileRes?.url}&caption=${message}&access_token=${insPages[pageIndex].access_token}`,
                'POST',
                {},
                function (response) {
                    window.FB?.api(
                        `/${insPages[pageIndex].id}/media_publish?creation_id=${response.id}&access_token=${insPages[pageIndex].access_token}`,
                        'POST',
                        {},
                        function (response) {
                            pendingPosts--;
                            if (pendingPosts === 0) {
                                setOpen(false);
                                setFile(null);
                                setConfirmLoading(false);
                                setPages([...pages]);
                            }
                        },
                    );
                },
            );
        });
        facebookChosenPages.forEach((pageIndex) => {
            window.FB?.api(
                `/${pages[pageIndex].id}/${pre}message=${message}&access_token=${pages[pageIndex].access_token}`,
                'POST',
                {},
                function (response) {
                    console.log('page: ', pages[pageIndex], 'message: ', message);
                    pendingPosts--;
                    if (pendingPosts === 0) {
                        setOpen(false);
                        setFile(null);
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
        window.FB?.api(
            '/me/accounts?fields=instagram_business_account{name,profile_picture_url},picture,name,access_token',
            'GET',
            {},
            function (response) {
                console.log('pages:', response.data);
                setInsPages(
                    response.data
                        ?.filter((page) => !!page.instagram_business_account)
                        ?.map((page) => {
                            return { ...page.instagram_business_account, access_token: page.access_token };
                        }),
                );
                setPages(response.data);
            },
        );
        // }
    }, [window.FB, isFbSDKInitialized]);
    useEffect(() => {
        getFBPosts(updateFBPosts);
    }, [pages]);
    const updateFBPosts = (newPosts) => {
        console.log('new post', newPosts);
        setPosts(
            [...posts, ...newPosts]
                .filter((item) => item.message || item.full_picture || item.caption || item.media_url)
                .sort((a, b) => {
                    if ((a.created_time ?? a.timestamp) < (b.created_time ?? b.timestamp)) return 1;
                    if ((a.created_time ?? a.timestamp) > (b.created_time ?? b.timestamp)) return -1;
                    return 0;
                }),
        );
    };
    const getFBPosts = (callback) => {
        let tempsFBPosts = [];
        insPages?.forEach((insAccount) => {
            window.FB?.api(
                `/${insAccount.id}/media?fields=timestamp,permalink,caption,media_url,like_count,comments_count&access_token=${insAccount.access_token}`,
                'GET',
                function (response) {
                    // Insert your code here

                    console.log(response);
                    tempsFBPosts = [
                        ...tempsFBPosts,
                        ...response.data.map((data) => ({ ...data, account: insAccount, type: 'instagram' })),
                    ];
                    callback(tempsFBPosts);
                },
            );
        });
        for (let i = 0; i < pages?.length; i++) {
            const page = pages[i];
            window.FB.api(
                `/${page.id}/feed?fields=shares,comments.summary(true),created_time,likes.summary(true),message,actions,story,message_tags,full_picture,from&access_token=${page.access_token}`,
                async function (response) {
                    if (response && !response.error) {
                        console.log(response);
                        tempsFBPosts = [
                            ...tempsFBPosts,
                            ...response.data.map((data) => ({ ...data, page, type: 'facebook' })),
                        ];
                        while (response.paging.next) {
                            response = await fetch(response.paging.next)
                                .then((response) => response.json())
                                .then((responseJson) => {
                                    return responseJson;
                                });
                            console.log(response);
                            tempsFBPosts = [
                                ...tempsFBPosts,
                                ...response.data.map((data) => ({ ...data, page, type: 'facebook' })),
                            ];
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
    const handleFilterChange = (value) => {
        console.log(value);
        setchosenFilter(value);
    };
    const handleMessageChange = (event) => {
        console.log(event.target.value);
        console.log(message);
        setMessage(event.target?.value);
    };
    const likePost = (post) => {
        console.log(post);
        if (post.type === 'facebook') {
            post.likes.summary.total_count++;
            post.likes.summary.has_liked = true;
        } else if (post.type === 'instagram') {
            post.like_count++;
            return;
        }
        console.log(posts);
        setPosts([...posts]);
        window.FB?.api(
            `/${post.id}/likes`,
            'POST',
            {
                access_token: post.page.access_token ?? post.account.access_token,
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
    console.log(posts);
    const selectFileHandler = (event) => {
        console.log(event.target.files[0]);
        setFile(event.target.files[0]);
    };

    return (
        <>
            <Space
                style={{
                    width: '500px',
                    marginBottom: 20,
                }}
                direction="horizontal"
            >
                <Select
                    mode="multiple"
                    style={{ width: '300px' }}
                    placeholder="filter pages..."
                    defaultValue={[]}
                    onChange={handleFilterChange}
                    optionLabelProp="label"
                >
                    {pages?.map((page, index) => (
                        <Option
                            key={'facebook,' + index}
                            value={page.id}
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
                                <span style={{ float: 'right' }}>{'(Facebook)'}</span>
                            </Space>
                        </Option>
                    ))}
                    {insPages?.map((page, index) => (
                        <Option
                            key={'instagram,' + index}
                            value={page.id}
                            label={
                                <Space>
                                    <Avatar
                                        src={page?.profile_picture_url}
                                        style={{ marginRight: 0, height: 20, width: 20 }}
                                    ></Avatar>
                                    {page.name}
                                </Space>
                            }
                        >
                            <Space>
                                <Avatar src={page?.profile_picture_url} style={{ marginRight: 0 }}></Avatar>
                                {page.name}
                                <span style={{ float: 'right' }}>{'(Instagram)'}</span>
                            </Space>
                        </Option>
                    ))}
                </Select>
                <Button onClick={showModal} type="primary">
                    Create a post
                </Button>
            </Space>
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
                                key={'facebook,' + index}
                                value={'facebook,' + index}
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
                                    <span style={{ float: 'right' }}>{'(Facebook)'}</span>
                                </Space>
                            </Option>
                        ))}
                        {insPages?.map((page, index) => (
                            <Option
                                key={'instagram,' + index}
                                value={'instagram,' + index}
                                label={
                                    <Space>
                                        <Avatar
                                            src={page?.profile_picture_url}
                                            style={{ marginRight: 0, height: 20, width: 20 }}
                                        ></Avatar>
                                        {page.name}
                                    </Space>
                                }
                            >
                                <Space>
                                    <Avatar src={page?.profile_picture_url} style={{ marginRight: 0 }}></Avatar>
                                    {page.name}
                                    <span style={{ float: 'right' }}>{'(Instagram)'}</span>
                                </Space>
                            </Option>
                        ))}
                    </Select>
                    <TextArea onChange={handleMessageChange} rows={6} placeholder="Say somthings....." />
                    <label htmlFor="file-upload" className="custom-file-upload">
                        <div>{file?.name ?? 'Upload image'}</div>
                    </label>
                    <input
                        id="file-upload"
                        style={{ display: 'none' }}
                        type="file"
                        onChange={selectFileHandler}
                    ></input>
                </Space>
                {!!errorMessage ? <span style={{ color: 'red' }}>{errorMessage}</span> : null}
            </Modal>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={posts}
                renderItem={(item, index) => {
                    console.log(chosenFilter);
                    console.log(item.id);
                    if (chosenFilter.length != 0 && !chosenFilter.some((pageId) => item.id.startsWith(pageId)))
                        return null;
                    if (item.message || item.full_picture || item.caption || item.media_url)
                        return (
                            <List.Item key={item.id}>
                                <Card
                                    title={
                                        <>
                                            <Avatar
                                                src={item.page?.picture?.data?.url ?? item.account?.profile_picture_url}
                                                style={{ marginRight: 20 }}
                                            ></Avatar>
                                            {item.from?.name ?? item.account?.name}
                                            <span style={{ fontWeight: 400, marginLeft: 10, color: 'grey' }}>
                                                {item.story}
                                            </span>
                                        </>
                                    }
                                    extra={
                                        <>
                                            <a target="_blank" href={item.actions?.[0]?.link ?? item.permalink}>
                                                See {item.type} post
                                            </a>
                                        </>
                                    }
                                    hoverable
                                    style={{ width: 500, margin: 'auto' }}
                                    actions={[
                                        <Badge size="small" count={item.likes?.summary?.total_count ?? item.like_count}>
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
                                        <Badge
                                            size="small"
                                            count={item.comments?.summary?.total_count ?? item.comments_count}
                                        >
                                            <CommentOutlined style={{ fontSize: '20px' }} />
                                        </Badge>,
                                        <Badge size="small" count={item.shares?.count}>
                                            <ShareAltOutlined style={{ fontSize: '20px' }} />{' '}
                                        </Badge>,
                                    ]}
                                >
                                    {item.message ?? item.caption}
                                    {item.full_picture || item.media_url ? (
                                        <img
                                            style={{ width: '100%', marginTop: 10 }}
                                            alt="example"
                                            src={item.full_picture ?? item.media_url}
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
