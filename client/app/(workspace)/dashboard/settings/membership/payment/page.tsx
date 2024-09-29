"use client"
import React, {useState} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from '@/components/ui/card';
import { validateBillingForm, BillingFormErrors } from './validation';


export interface Customer {
    fullName: string;
    email: string;
    subscription: {
      trialPeriod: number;
      billingPeriod: number;
      maxBillingPeriods: number;
      initialBillingPeriodCharge: number;
    };
    id: string;
  }

const countries: string[] = ["United State", "United Kingdom", "Australia", "China"]

const PaymentPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const [errors, setErrors] = useState<BillingFormErrors>({
    fullName: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateBillingForm(fullName, email, cardNumber, expiryDate, cvv);

    setErrors(validationErrors);

    const isValid = Object.values(validationErrors).every((error) => error === '');

    if (isValid) {
      // Add your form submission logic here (e.g., send data to API)
      alert('Form is valid. Processing payment...');
    } else {
      alert('Please correct the errors in the form.');
    }
  };

  return (
    <div >
        <h1>Billing Information</h1>
        <Tabs defaultValue="Card" className="">
        <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="Card">Card</TabsTrigger>
            <TabsTrigger value="Paypal">Paypal</TabsTrigger>
        </TabsList>
        <TabsContent value="Card">
            <Card className="shadow-xl">
                <form className="flex flex-col p-8 space-y-4">
                    <div>
                    <label htmlFor="fullName">Full Name</label>
                    <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        required
                    />
                    </div>

                    <div>
                    <label htmlFor="cardNumber">Card Number</label>
                    <Input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                    />
                    </div>

                    <div className="flex flex-row gap-4 items-start space-x-4">
                        <div className="w-full">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <Input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            required
                        />
                        </div>

                        <div className="w-full">
                        <label htmlFor="cvv">CVV</label>
                        <Input
                            type="text"
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            required
                        />
                        </div>
                    </div>

                    <div>
                    <label htmlFor="email">Email Address</label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="example@example.com"
                        required
                    />
                    </div>

                    <div>
                    <label htmlFor="billing country">Billing Country</label>
                        <Select>
                            <SelectTrigger className="">
                            <SelectValue placeholder="United States" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Billing Countries</SelectLabel>
                                {countries.map((item, index) => (
                                    <SelectItem value={item} key={index}>{item}</SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                    <label htmlFor="postcode">Postcode</label>
                    <Input
                        type="text"
                        id="postcode"
                        name="postcode"
                        placeholder="1234"
                        required
                    />
                    </div>

                    <Button type="submit">
                    Submit Payment
                    </Button>
                </form>
            </Card>
        </TabsContent>
        <TabsContent value="Paypal">
            <Card className="shadow-xl">
                <form className="flex flex-col p-8 space-y-4">
                    <div>
                        <label htmlFor="billing country">Billing Country</label>
                            <Select>
                                <SelectTrigger className="">
                                <SelectValue placeholder="United States" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Billing Countries</SelectLabel>
                                    {countries.map((item, index) => (
                                        <SelectItem value={item} key={index}>{item}</SelectItem>
                                    ))}
                                </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                        <label htmlFor="postcode">Postcode</label>
                        <Input
                            type="text"
                            id="postcode"
                            name="postcode"
                            placeholder="1234"
                            required
                        />
                    </div>
                    <Button type="submit">
                        Submit Payment
                    </Button>
                </form>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
};

export default PaymentPage;

// export default function PaymentPage(){
//     return <div>Payment Page</div>
// }