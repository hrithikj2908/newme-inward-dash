import { useEffect, useState } from "react";
import { Drawer, Button, Table, Space, Typography, Tag, Input, Select, message, Empty } from "antd";
import { ShoppingCartOutlined, DeleteOutlined, PlayCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { getSavedCarts, resumeCart, deleteSavedCart } from "@/services/billingMockService";
import type { SavedCart, Cart } from "@/types/billing";

const { Title, Text } = Typography;
const { Option } = Select;

interface SavedCartsDrawerProps {
  open: boolean;
  onClose: () => void;
  onResume: (cart: Partial<Cart>) => void;
}

export function SavedCartsDrawer({ open, onClose, onResume }: SavedCartsDrawerProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (open) {
      loadSavedCarts();
    }
  }, [open]);

  const loadSavedCarts = async () => {
    try {
      const carts = await getSavedCarts();
      setSavedCarts(carts);
    } catch (error) {
      messageApi.error("Failed to load saved carts");
    }
  };

  const handleResume = async (cartId: string) => {
    try {
      const result = await resumeCart(cartId);
      messageApi.success("Cart resumed. Prices and offers re-applied.");
      onResume(result.cart);
      onClose();
    } catch (error) {
      messageApi.error(String(error));
    }
  };

  const handleDelete = async (cartId: string) => {
    try {
      await deleteSavedCart(cartId);
      messageApi.success("Cart deleted");
      loadSavedCarts();
    } catch (error) {
      messageApi.error(String(error));
    }
  };

  const filteredCarts = savedCarts.filter((cart) => {
    const matchesSearch =
      cart.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cart.customer?.phone?.includes(searchQuery) ||
      cart.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || cart.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Cart Label",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: SavedCart) =>
        record.customer?.isGuest ? (
          <Tag>Guest</Tag>
        ) : (
          <div>
            <div>{record.customer?.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.customer?.phone}
            </Text>
          </div>
        ),
    },
    {
      title: "Items",
      dataIndex: "lines",
      key: "items",
      render: (lines: any[]) => `${lines.length} items`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotalAtSave",
      key: "subtotal",
      render: (subtotal: number) => `₹${subtotal.toFixed(2)}`,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "SAVED" ? "green" : status === "LOCKED" ? "orange" : status === "EXPIRED" ? "red" : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: SavedCart) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleResume(record.id)}
            disabled={record.status === "LOCKED"}
          >
            Resume
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <ShoppingCartOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Saved Carts
          </Title>
        </Space>
      }
      placement="right"
      width={1000}
      open={open}
      onClose={onClose}
    >
      {contextHolder}
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Input
            placeholder="Search by label, name, or phone"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
            <Option value="all">All Status</Option>
            <Option value="SAVED">Saved</Option>
            <Option value="LOCKED">Locked</Option>
            <Option value="EXPIRED">Expired</Option>
            <Option value="PENDING_SYNC">Pending Sync</Option>
          </Select>
        </Space>

        {filteredCarts.length === 0 ? (
          <Empty description="No saved carts" />
        ) : (
          <Table dataSource={filteredCarts} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
        )}
      </Space>
    </Drawer>
  );
}
