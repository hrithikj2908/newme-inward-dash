import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  InputNumber,
  Table,
  Space,
  Typography,
  Divider,
  Tag,
  Checkbox,
  message,
  Row,
  Col,
  Card,
  Tabs,
} from "antd";
import {
  CreditCardOutlined,
  DollarOutlined,
  WalletOutlined,
  GiftOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { Cart, PaymentLine, PaymentMode, CreditNote } from "@/types/billing";
import { createInvoice, getCreditNotes } from "@/services/billingMockService";

const { Title, Text } = Typography;
const { Option } = Select;

interface PaymentModalProps {
  cart: Cart;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

export function PaymentModal({ cart, onClose, onSuccess }: PaymentModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);
  const [selectedMode, setSelectedMode] = useState<PaymentMode>("CASH");
  const [isOffline] = useState(false);

  // Mode-specific inputs
  const [cardType, setCardType] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [authNo, setAuthNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [selectedCreditNotes, setSelectedCreditNotes] = useState<string[]>([]);
  const [cashReceived, setCashReceived] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [walletRef, setWalletRef] = useState("");
  const [giftCardRef, setGiftCardRef] = useState("");

  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  const totalPaid = paymentLines.reduce((sum, line) => sum + line.amount, 0);
  const remaining = cart.totalPayable - totalPaid;

  useEffect(() => {
    if (selectedMode === "CREDIT_NOTE" && cart.customer?.phone) {
      getCreditNotes(cart.customer.phone).then(setCreditNotes);
    }
  }, [selectedMode, cart.customer]);

  const resetModeInputs = () => {
    setCardType("");
    setLast4Digits("");
    setAuthNo("");
    setBankName("");
    setUpiRef("");
    setSelectedCreditNotes([]);
    setCashReceived(0);
    setCurrentAmount(0);
    setWalletRef("");
    setGiftCardRef("");
  };

  const handleAddPaymentLine = () => {
    if (editingLineIndex !== null) {
      const updatedLines = [...paymentLines];
      updatedLines[editingLineIndex] = buildPaymentLine();
      setPaymentLines(updatedLines);
      setEditingLineIndex(null);
      messageApi.success("Payment line updated");
    } else {
      const newLine = buildPaymentLine();
      setPaymentLines([...paymentLines, newLine]);
      messageApi.success("Payment line added");
    }
    resetModeInputs();
    setSelectedMode("CASH");
  };

  const buildPaymentLine = (): PaymentLine => {
    const base: PaymentLine = {
      mode: selectedMode,
      amount: currentAmount || remaining,
    };

    if (selectedMode === "CARD") {
      return {
        ...base,
        cardType,
        last4Digits,
        authNo,
        bankName,
        ref: authNo,
      };
    } else if (selectedMode === "UPI") {
      return { ...base, upiRef, ref: upiRef };
    } else if (selectedMode === "CREDIT_NOTE") {
      const total = selectedCreditNotes.reduce((sum, id) => {
        const cn = creditNotes.find((c) => c.id === id);
        return sum + (cn?.amount || 0);
      }, 0);
      return {
        ...base,
        amount: total,
        creditNoteIds: selectedCreditNotes,
        ref: selectedCreditNotes.join(", "),
      };
    } else if (selectedMode === "CASH") {
      return { ...base, amount: currentAmount || remaining };
    } else if (selectedMode === "WALLET") {
      return { ...base, ref: walletRef };
    } else if (selectedMode === "GIFTCARD") {
      return { ...base, ref: giftCardRef };
    }
    return base;
  };

  const handleEditLine = (index: number) => {
    const line = paymentLines[index];
    setEditingLineIndex(index);
    setSelectedMode(line.mode);
    setCurrentAmount(line.amount);

    if (line.mode === "CARD") {
      setCardType(line.cardType || "");
      setLast4Digits(line.last4Digits || "");
      setAuthNo(line.authNo || "");
      setBankName(line.bankName || "");
    } else if (line.mode === "UPI") {
      setUpiRef(line.upiRef || "");
    } else if (line.mode === "CREDIT_NOTE") {
      setSelectedCreditNotes(line.creditNoteIds || []);
    } else if (line.mode === "WALLET") {
      setWalletRef(line.ref || "");
    } else if (line.mode === "GIFTCARD") {
      setGiftCardRef(line.ref || "");
    }
  };

  const handleDeleteLine = (index: number) => {
    const updated = paymentLines.filter((_, i) => i !== index);
    setPaymentLines(updated);
    messageApi.success("Payment line removed");
  };

  const handleConfirm = async () => {
    if (remaining !== 0) {
      messageApi.error("Remaining amount must be ₹0 to confirm");
      return;
    }
    try {
      const invoice = await createInvoice(cart, paymentLines);
      messageApi.success(`Invoice ${invoice.id} created`);
      onSuccess(invoice.id);
    } catch (error) {
      messageApi.error(String(error));
    }
  };

  const columns = [
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (mode: PaymentMode) => <Tag color="blue">{mode}</Tag>,
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
    {
      title: "Action",
      key: "action",
      render: (_: any, record: PaymentLine, index: number) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditLine(index)} />
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteLine(index)} />
        </Space>
      ),
    },
  ];

  const renderModeInputs = () => {
    if (selectedMode === "CARD") {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            placeholder="Card Type"
            value={cardType}
            onChange={setCardType}
            style={{ width: "100%" }}
          >
            <Option value="Visa">Visa</Option>
            <Option value="MasterCard">MasterCard</Option>
            <Option value="Rupay">Rupay</Option>
            <Option value="Amex">Amex</Option>
          </Select>
          <Input placeholder="Last 4 Digits" value={last4Digits} onChange={(e) => setLast4Digits(e.target.value)} maxLength={4} />
          <Input placeholder="Auth/Approval No." value={authNo} onChange={(e) => setAuthNo(e.target.value)} />
          <Input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          <InputNumber
            placeholder="Amount"
            value={currentAmount || remaining}
            onChange={(val) => setCurrentAmount(val || 0)}
            style={{ width: "100%" }}
            prefix="₹"
          />
        </Space>
      );
    } else if (selectedMode === "UPI") {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input placeholder="UPI Reference / Txn No." value={upiRef} onChange={(e) => setUpiRef(e.target.value)} />
          <InputNumber
            placeholder="Amount"
            value={currentAmount || remaining}
            onChange={(val) => setCurrentAmount(val || 0)}
            style={{ width: "100%" }}
            prefix="₹"
          />
        </Space>
      );
    } else if (selectedMode === "CREDIT_NOTE") {
      const totalCN = selectedCreditNotes.reduce((sum, id) => {
        const cn = creditNotes.find((c) => c.id === id);
        return sum + (cn?.amount || 0);
      }, 0);
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Available Credit Notes:</Text>
          <Checkbox.Group value={selectedCreditNotes} onChange={(vals) => setSelectedCreditNotes(vals as string[])}>
            <Space direction="vertical">
              {creditNotes.map((cn) => (
                <Checkbox key={cn.id} value={cn.id}>
                  {cn.number} - ₹{cn.amount.toFixed(2)}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
          <Text>Total Applied: ₹{totalCN.toFixed(2)}</Text>
        </Space>
      );
    } else if (selectedMode === "CASH") {
      const change = cashReceived - (currentAmount || remaining);
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <InputNumber
            placeholder="Amount"
            value={currentAmount || remaining}
            onChange={(val) => setCurrentAmount(val || 0)}
            style={{ width: "100%" }}
            prefix="₹"
          />
          <InputNumber
            placeholder="Cash Received"
            value={cashReceived}
            onChange={(val) => setCashReceived(val || 0)}
            style={{ width: "100%" }}
            prefix="₹"
          />
          {change > 0 && (
            <Text strong style={{ color: "#52c41a" }}>
              Change Due: ₹{change.toFixed(2)}
            </Text>
          )}
        </Space>
      );
    } else if (selectedMode === "WALLET") {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input placeholder="Wallet Reference" value={walletRef} onChange={(e) => setWalletRef(e.target.value)} />
          <InputNumber
            placeholder="Amount"
            value={currentAmount || remaining}
            onChange={(val) => setCurrentAmount(val || 0)}
            style={{ width: "100%" }}
            prefix="₹"
          />
        </Space>
      );
    } else if (selectedMode === "GIFTCARD") {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input placeholder="Gift Card Reference" value={giftCardRef} onChange={(e) => setGiftCardRef(e.target.value)} />
          <InputNumber
            placeholder="Amount"
            value={currentAmount || remaining}
            onChange={(val) => setCurrentAmount(val || 0)}
            style={{ width: "100%" }}
            prefix="₹"
          />
        </Space>
      );
    }
    return null;
  };

  const modeItems = [
    { key: "CASH", label: "Cash", icon: <DollarOutlined /> },
    { key: "CARD", label: "Card", icon: <CreditCardOutlined />, disabled: isOffline },
    { key: "UPI", label: "UPI", icon: <WalletOutlined />, disabled: isOffline },
    { key: "CREDIT_NOTE", label: "Credit Note", icon: <GiftOutlined />, disabled: isOffline },
    { key: "WALLET", label: "Wallet", icon: <WalletOutlined />, disabled: isOffline },
    { key: "GIFTCARD", label: "Gift Card", icon: <GiftOutlined />, disabled: isOffline },
  ];

  return (
    <Modal
      open={true}
      onCancel={onClose}
      title={<Title level={3}>Complete Payment</Title>}
      width={900}
      footer={null}
    >
      {contextHolder}
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Amount Due:</Text>
              <div>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>₹{cart.totalPayable.toFixed(2)}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Total Paid:</Text>
              <div>
                <Text style={{ fontSize: 28, fontWeight: "bold", color: "#52c41a" }}>₹{totalPaid.toFixed(2)}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Remaining:</Text>
              <div>
                <Text style={{ fontSize: 28, fontWeight: "bold", color: remaining === 0 ? "#52c41a" : "#ff4d4f" }}>
                  ₹{remaining.toFixed(2)}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Title level={5}>Select Payment Mode</Title>
        <Tabs
          activeKey={selectedMode}
          onChange={(key) => setSelectedMode(key as PaymentMode)}
          items={modeItems.map((item) => ({
            key: item.key,
            label: (
              <span>
                {item.icon} {item.label}
              </span>
            ),
            disabled: item.disabled,
          }))}
        />

        <Card>{renderModeInputs()}</Card>

        <Button type="primary" onClick={handleAddPaymentLine} block>
          {editingLineIndex !== null ? "Update Payment Line" : "Add Payment Line"}
        </Button>

        {paymentLines.length > 0 && (
          <>
            <Divider />
            <Title level={5}>Payment Breakdown</Title>
            <Table dataSource={paymentLines} columns={columns} pagination={false} rowKey={(_, index) => index!} />
          </>
        )}

        <Divider />

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Back</Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirm}
            disabled={remaining !== 0}
          >
            Confirm Payment
          </Button>
        </Space>
      </Space>
    </Modal>
  );
}
