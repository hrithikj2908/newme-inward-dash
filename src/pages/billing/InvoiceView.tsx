import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Table, Space, Typography, Divider, Row, Col, Tag, message } from "antd";
import { PrinterOutlined, FileAddOutlined } from "@ant-design/icons";
import type { Invoice } from "@/types/billing";

const { Title, Text } = Typography;

// Mock invoice getter - TODO: wire to backend
const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  return {
    id: invoiceId,
    cartId: "CART-001",
    createdAt: new Date().toISOString(),
    customer: { name: "Rajesh Kumar", phone: "9876543210" },
    staff: { id: "STAFF-001", name: "Vikram Singh" },
    storeId: "STORE-001",
    lines: [
      {
        sku: "SKU-101",
        barcode: "8901234567890",
        name: "Premium Tea 250g",
        mrp: 250,
        offerPrice: 225,
        qty: 2,
      },
      {
        sku: "SKU-102",
        barcode: "8901234567891",
        name: "Coffee Beans 500g",
        mrp: 450,
        offerPrice: 400,
        qty: 1,
      },
    ],
    payments: [{ mode: "CASH", amount: 850, ref: "" }],
    totals: {
      subtotal: 850,
      discounts: 0,
      payable: 850,
    },
  };
};

export default function InvoiceView() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (invoiceId) {
      getInvoice(invoiceId)
        .then(setInvoice)
        .catch(() => messageApi.error("Invoice not found"));
    }
  }, [invoiceId]);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {contextHolder}
        <Text>Loading invoice...</Text>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
    messageApi.success("Print dialog opened");
  };

  const handleNewBill = () => {
    navigate("/billing");
  };

  const columns = [
    {
      title: "Item",
      key: "item",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.barcode}
          </Text>
        </div>
      ),
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      key: "mrp",
      render: (mrp: number) => `₹${mrp.toFixed(2)}`,
    },
    {
      title: "Offer",
      dataIndex: "offerPrice",
      key: "offerPrice",
      render: (offerPrice?: number) => (offerPrice ? `₹${offerPrice.toFixed(2)}` : "-"),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Line Total",
      key: "lineTotal",
      render: (_: any, record: any) => {
        const price = record.offerPrice || record.mrp;
        return `₹${(price * record.qty).toFixed(2)}`;
      },
    },
  ];

  const paymentColumns = [
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (mode: string) => <Tag color="blue">{mode}</Tag>,
    },
    {
      title: "Reference",
      dataIndex: "ref",
      key: "ref",
      render: (ref?: string) => ref || "-",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₹${amount.toFixed(2)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {contextHolder}
      <div className="mx-auto max-w-4xl">
        <Card>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div className="text-center">
              <Title level={2}>INVOICE</Title>
              <Text strong>Invoice #: {invoice.id}</Text>
            </div>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Store ID:</Text>
                <div>{invoice.storeId}</div>
              </Col>
              <Col span={12}>
                <Text strong>Date/Time:</Text>
                <div>{new Date(invoice.createdAt).toLocaleString()}</div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Staff:</Text>
                <div>{invoice.staff.name}</div>
              </Col>
              <Col span={12}>
                <Text strong>Customer:</Text>
                <div>
                  {invoice.customer.isGuest ? (
                    <Tag>Guest</Tag>
                  ) : (
                    <>
                      {invoice.customer.name}
                      <br />
                      {invoice.customer.phone}
                    </>
                  )}
                </div>
              </Col>
            </Row>

            <Divider />

            <div>
              <Title level={4}>Items</Title>
              <Table dataSource={invoice.lines} columns={columns} rowKey="sku" pagination={false} />
            </div>

            <Divider />

            <Row gutter={16}>
              <Col span={12} offset={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="flex justify-between">
                    <Text>Subtotal:</Text>
                    <Text strong>₹{invoice.totals.subtotal.toFixed(2)}</Text>
                  </div>
                  <div className="flex justify-between" style={{ color: "#52c41a" }}>
                    <Text>Discounts:</Text>
                    <Text>- ₹{invoice.totals.discounts.toFixed(2)}</Text>
                  </div>
                  {invoice.totals.taxes && (
                    <div className="flex justify-between">
                      <Text>Taxes:</Text>
                      <Text>₹{invoice.totals.taxes.toFixed(2)}</Text>
                    </div>
                  )}
                  {invoice.totals.rounding && (
                    <div className="flex justify-between">
                      <Text>Rounding:</Text>
                      <Text>₹{invoice.totals.rounding.toFixed(2)}</Text>
                    </div>
                  )}
                  <Divider style={{ margin: "8px 0" }} />
                  <div className="flex justify-between">
                    <Text strong style={{ fontSize: 18 }}>
                      Total Payable:
                    </Text>
                    <Text strong style={{ fontSize: 18 }}>
                      ₹{invoice.totals.payable.toFixed(2)}
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>

            <Divider />

            <div>
              <Title level={4}>Payment Breakdown</Title>
              <Table dataSource={invoice.payments} columns={paymentColumns} rowKey={(_, index) => index!} pagination={false} />
            </div>

            <Divider />

            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button type="primary" size="large" icon={<PrinterOutlined />} onClick={handlePrint}>
                Print Invoice
              </Button>
              <Button size="large" icon={<FileAddOutlined />} onClick={handleNewBill}>
                New Bill
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    </div>
  );
}
