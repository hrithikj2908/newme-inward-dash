import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Table,
  Space,
  Card,
  Typography,
  AutoComplete,
  message,
  Badge,
  Empty,
  InputNumber,
} from "antd";
import {
  ScanOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  SaveOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { Cart, CartLine, Customer, Staff, BillManualDiscount } from "@/types/billing";
import {
  searchCustomers,
  getItemByBarcode,
  applyAutoDiscounts,
  computeTotals,
  mockStaff,
  saveCart,
} from "@/services/billingMockService";
import { PaymentModal } from "./PaymentModal";
import { SavedCartsDrawer } from "./SavedCartsDrawer";

const { Title, Text } = Typography;
const { Option } = Select;

export default function BillingWorkspace() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Cart state
  const [cart, setCart] = useState<Partial<Cart>>({
    customer: {},
    staff: mockStaff[0],
    lines: [],
    autoDiscounts: [],
    billManualDiscounts: [],
    subtotal: 0,
    totalDiscount: 0,
    totalPayable: 0,
  });

  // UI state
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<{ value: string; label: string }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScanned, setLastScanned] = useState<CartLine | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSavedCarts, setShowSavedCarts] = useState(false);
  const [manualDiscountReason, setManualDiscountReason] = useState("");
  const [manualDiscountValue, setManualDiscountValue] = useState<number | null>(null);
  const [manualDiscountType, setManualDiscountType] = useState<"AMOUNT" | "PERCENT">("AMOUNT");

  // Fetch customer suggestions
  useEffect(() => {
    if (phoneInput.length >= 3) {
      searchCustomers(phoneInput).then((customers) => {
        setCustomerSuggestions(
          customers.map((c) => ({
            value: c.phone || "",
            label: `${c.name} - ${c.phone}`,
          }))
        );
      });
    } else {
      setCustomerSuggestions([]);
    }
  }, [phoneInput]);

  // Recompute totals whenever cart changes
  useEffect(() => {
    if (cart.lines && cart.lines.length > 0) {
      computeTotals(cart).then((totals) => {
        setCart((prev) => ({ ...prev, ...totals }));
      });
    }
  }, [cart.lines, cart.autoDiscounts, cart.billManualDiscounts]);

  // Apply auto discounts when lines change
  useEffect(() => {
    if (cart.lines && cart.lines.length > 0) {
      applyAutoDiscounts(cart.lines).then((autoDiscounts) => {
        setCart((prev) => ({ ...prev, autoDiscounts }));
      });
    }
  }, [cart.lines]);

  const handleCustomerSelect = (value: string, option: any) => {
    setPhoneInput(value);
    const customer = customerSuggestions.find((c) => c.value === value);
    if (customer) {
      const name = customer.label.split(" - ")[0];
      setNameInput(name);
      setCart((prev) => ({ ...prev, customer: { phone: value, name } }));
    }
  };

  const handleSkipCustomer = () => {
    const randomPhone = `GUEST-${Math.floor(Math.random() * 10000)}`;
    setCart((prev) => ({
      ...prev,
      customer: { isGuest: true, phone: randomPhone },
    }));
    setPhoneInput(randomPhone);
    setNameInput("Guest");
    messageApi.info("Guest customer added");
  };

  const handleScanBarcode = async () => {
    if (!barcodeInput.trim()) return;

    try {
      const item = await getItemByBarcode(barcodeInput);
      const existingLine = cart.lines?.find((l) => l.sku === item.sku);

      if (existingLine) {
        setCart((prev) => ({
          ...prev,
          lines: prev.lines?.map((l) =>
            l.sku === item.sku ? { ...l, qty: l.qty + 1 } : l
          ),
        }));
      } else {
        const newLine: CartLine = {
          ...item,
          qty: 1,
        };
        setCart((prev) => ({
          ...prev,
          lines: [...(prev.lines || []), newLine],
        }));
        setLastScanned(newLine);
      }

      setBarcodeInput("");
      messageApi.success(`${item.name} added`);
    } catch (error) {
      messageApi.error("Invalid barcode");
    }
  };

  const handleQuantityChange = (sku: string, delta: number) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines
        ?.map((l) =>
          l.sku === sku
            ? { ...l, qty: Math.max(1, l.qty + delta) }
            : l
        )
        .filter((l) => l.qty > 0),
    }));
  };

  const handleRemoveLine = (sku: string) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines?.filter((l) => l.sku !== sku),
    }));
    messageApi.success("Item removed");
  };

  const handleAddManualDiscount = () => {
    if (!manualDiscountReason.trim() || !manualDiscountValue) {
      messageApi.error("Discount reason and value required");
      return;
    }

    const discount: BillManualDiscount = {
      type: manualDiscountType,
      value: manualDiscountValue,
      reason: manualDiscountReason,
    };

    setCart((prev) => ({
      ...prev,
      billManualDiscounts: [...(prev.billManualDiscounts || []), discount],
    }));

    setManualDiscountReason("");
    setManualDiscountValue(null);
    messageApi.success("Discount applied");
  };

  const handleSaveCart = async () => {
    if (!cart.lines || cart.lines.length === 0) {
      messageApi.error("Cart is empty");
      return;
    }

    try {
      await saveCart(cart, saveLabel || `Cart ${Date.now()}`);
      messageApi.success("Cart saved successfully");
      setShowSaveModal(false);
      setSaveLabel("");
      // Clear workspace
      setCart({
        customer: {},
        staff: mockStaff[0],
        lines: [],
        autoDiscounts: [],
        billManualDiscounts: [],
        subtotal: 0,
        totalDiscount: 0,
        totalPayable: 0,
      });
      setPhoneInput("");
      setNameInput("");
    } catch (error) {
      messageApi.error("Failed to save cart");
    }
  };

  const handleResumeCart = (resumedCart: Partial<Cart>) => {
    setCart(resumedCart);
    setPhoneInput(resumedCart.customer?.phone || "");
    setNameInput(resumedCart.customer?.name || "");
    setShowSavedCarts(false);
    messageApi.success("Cart resumed");
  };

  const canProceedToPayment = cart.lines && cart.lines.length > 0;

  const columns = [
    {
      title: "Item",
      key: "item",
      render: (_: any, record: CartLine) => (
        <Space>
          {record.imageUrl && (
            <img src={record.imageUrl} alt={record.name} className="w-12 h-12 object-cover rounded" />
          )}
          <div>
            <div className="font-medium">{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.sku}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      key: "mrp",
      render: (mrp: number) => `₹${mrp}`,
    },
    {
      title: "Offer",
      dataIndex: "offerPrice",
      key: "offerPrice",
      render: (offerPrice?: number) => (offerPrice ? `₹${offerPrice}` : "-"),
    },
    {
      title: "Qty",
      key: "qty",
      render: (_: any, record: CartLine) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(record.sku, -1)}
            disabled={record.qty <= 1}
          />
          <span className="px-2">{record.qty}</span>
          <Button size="small" icon={<PlusOutlined />} onClick={() => handleQuantityChange(record.sku, 1)} />
        </Space>
      ),
    },
    {
      title: "Total",
      key: "lineTotal",
      render: (_: any, record: CartLine) => {
        const price = record.offerPrice || record.mrp;
        return `₹${(price * record.qty).toFixed(2)}`;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: CartLine) => (
        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveLine(record.sku)} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {contextHolder}
      <div className="mx-auto max-w-7xl">
        <Title level={2}>Billing Workspace</Title>

        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* LEFT: Customer & Staff */}
          <div className="col-span-3">
            <Card title={<><UserOutlined /> Customer & Staff</>} className="sticky top-6">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div>
                  <Text strong>Phone</Text>
                  <AutoComplete
                    style={{ width: "100%", marginTop: 8 }}
                    options={customerSuggestions}
                    value={phoneInput}
                    onChange={setPhoneInput}
                    onSelect={handleCustomerSelect}
                    placeholder="10-digit phone"
                    maxLength={10}
                  />
                </div>

                <div>
                  <Text strong>Name</Text>
                  <Input
                    style={{ marginTop: 8 }}
                    placeholder="Customer name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                </div>

                <Button block onClick={handleSkipCustomer}>
                  Skip / Random
                </Button>

                <div>
                  <Text strong>Staff</Text>
                  <Select
                    style={{ width: "100%", marginTop: 8 }}
                    value={cart.staff?.id}
                    onChange={(id) => {
                      const staff = mockStaff.find((s) => s.id === id);
                      if (staff) setCart((prev) => ({ ...prev, staff }));
                    }}
                  >
                    {mockStaff.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Badge
                    color={cart.customer?.isGuest ? "default" : cart.customer?.phone ? "blue" : "green"}
                    text={cart.customer?.isGuest ? "Guest" : cart.customer?.phone ? "Returning" : "New"}
                  />
                </div>
              </Space>
            </Card>
          </div>

          {/* CENTER: Scan & Cart */}
          <div className="col-span-6">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Card title="Scan Item">
                <Space style={{ width: "100%" }}>
                  <Button type="primary" size="large" icon={<ScanOutlined />} onClick={handleScanBarcode}>
                    Scan Item
                  </Button>
                  <Input
                    placeholder="Enter barcode"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onPressEnter={handleScanBarcode}
                    style={{ flex: 1 }}
                    size="large"
                  />
                </Space>

                {lastScanned && (
                  <Card size="small" style={{ marginTop: 16, backgroundColor: "#f0f0f0" }}>
                    <Space>
                      {lastScanned.imageUrl && (
                        <img src={lastScanned.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                      )}
                      <div style={{ flex: 1 }}>
                        <div className="font-medium">{lastScanned.name}</div>
                        <Text type="secondary">₹{(lastScanned.offerPrice || lastScanned.mrp).toFixed(2)}</Text>
                      </div>
                      <Button
                        size="small"
                        onClick={() => {
                          handleRemoveLine(lastScanned.sku);
                          setLastScanned(null);
                        }}
                      >
                        Undo
                      </Button>
                    </Space>
                  </Card>
                )}
              </Card>

              <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    Cart ({cart.lines?.length || 0} items)
                  </Space>
                }
              >
                {!cart.lines || cart.lines.length === 0 ? (
                  <Empty description="No items scanned yet" />
                ) : (
                  <Table
                    dataSource={cart.lines}
                    columns={columns}
                    rowKey="sku"
                    pagination={false}
                    scroll={{ y: 400 }}
                  />
                )}
              </Card>
            </Space>
          </div>

          {/* RIGHT: Price Breakdown */}
          <div className="col-span-3">
            <Card title="Price Breakdown" className="sticky top-6">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <Text>Subtotal</Text>
                    <Text strong>₹{cart.subtotal?.toFixed(2) || "0.00"}</Text>
                  </div>
                  <div className="flex justify-between" style={{ color: "#52c41a" }}>
                    <Text>Total Discount</Text>
                    <Text>- ₹{cart.totalDiscount?.toFixed(2) || "0.00"}</Text>
                  </div>
                  {cart.taxes && (
                    <div className="flex justify-between">
                      <Text>Taxes</Text>
                      <Text>₹{cart.taxes.toFixed(2)}</Text>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <Text strong style={{ fontSize: 16 }}>
                      Total Payable
                    </Text>
                    <Text strong style={{ fontSize: 24 }}>
                      ₹{cart.totalPayable?.toFixed(2) || "0.00"}
                    </Text>
                  </div>
                </div>

                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<DollarOutlined />}
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!canProceedToPayment}
                  >
                    Proceed to Payment
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<SaveOutlined />}
                    onClick={() => setShowSaveModal(true)}
                    disabled={!canProceedToPayment}
                  >
                    Save Cart
                  </Button>
                  <Button block onClick={() => setShowSavedCarts(true)}>
                    View Saved Carts
                  </Button>
                </Space>
              </Space>
            </Card>
          </div>
        </div>
      </div>

      {showPaymentModal && cart && (
        <PaymentModal
          cart={cart as Cart}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(invoiceId) => navigate(`/billing/invoice/${invoiceId}`)}
        />
      )}

      {showSavedCarts && (
        <SavedCartsDrawer
          open={showSavedCarts}
          onClose={() => setShowSavedCarts(false)}
          onResume={handleResumeCart}
        />
      )}
    </div>
  );
}
