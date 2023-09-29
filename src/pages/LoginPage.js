import React, { useState } from 'react';
import { Component } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import AuthProvider, { useAuth, RequireAuth, fakeAuthProvider } from '../AuthProvider';
import { Button, Checkbox, Form, Input, Typography, Select } from 'antd';
import { message, Row, Col, Icon } from 'antd';
export default function LoginPage() {
    let navigate = useNavigate();
    const { Option } = Select;
    let location = useLocation();
    let auth = useAuth();
    let [step, setStep] = useState(1);
    let from = location.state?.from?.pathname || '/';
    const { Text } = Typography;
    const prefixSelector = (
        <Form.Item name="prefix" noStyle>
            <Select style={{ width: 80 }}>
                <Option value="+86">+86</Option>
                <Option value="+87">+87</Option>
                <Option value="+1">+1</Option>
                <Option value="+84">+84</Option>
            </Select>
        </Form.Item>
    );
    return (
        <Row style={{ background: '#f5f5f5', height: '100vh' }}>
            <Form
                name="basic"
                requiredMark={false}
                layout="vertical"
                size="large"
                style={{
                    maxWidth: 800,
                    background: '#ffffff',
                    padding: '50px',
                    margin: 'auto auto',
                    borderRadius: '8px',
                }}
                initialValues={{
                    remember: true,
                }}
                onFinish={async (data) => {
                    console.log(data);
                    if (step === 1) {
                        const res = await auth.sendCode(data.prefix + data.phoneNumber);
                        if (res.success) {
                            setStep(2);
                        } else {
                            message.error('Phone number not valid');
                        }
                    } else {
                        const res = await auth.checkCode(data.code, () => {});
                        if (res.success) {
                            navigate('/', { replace: true });
                        } else {
                            message.error(res.message);
                        }
                    }
                }}
                onFinishFailed={() => {
                    console.log('finish failed');
                }}
                autoComplete="off"
            >
                <p
                    style={{
                        marginTop: '0',
                        fontSize: '24px',
                        textAlign: 'center',
                        fontWeight: '900',
                        color: 'rgb(64, 150, 255)',
                    }}
                >
                    Sign in to you account
                </p>
                {step === 1 ? (
                    <Form.Item
                        label="Phone Number"
                        name="phoneNumber"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your phone number!',
                            },
                        ]}
                    >
                        <Input addonBefore={prefixSelector} />
                    </Form.Item>
                ) : (
                    <Form.Item
                        label="Enter Code"
                        name="code"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter code!',
                            },
                        ]}
                    >
                        <Input />
                        {/* <Text type="danger">Code are not corrent</Text> */}
                    </Form.Item>
                )}

                <Form.Item>
                    <Button size="large" type="primary" htmlType="submit" block>
                        Continue
                    </Button>
                </Form.Item>
            </Form>
        </Row>
    );
}
