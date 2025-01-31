# RequestPricingsGetPricingArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tier** | [**RequestPricingsGetPricingArgsTier**](RequestPricingsGetPricingArgsTier.md) |  | 

## Example

```python
from convex_client.models.request_pricings_get_pricing_args import RequestPricingsGetPricingArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestPricingsGetPricingArgs from a JSON string
request_pricings_get_pricing_args_instance = RequestPricingsGetPricingArgs.from_json(json)
# print the JSON string representation of the object
print(RequestPricingsGetPricingArgs.to_json())

# convert the object into a dict
request_pricings_get_pricing_args_dict = request_pricings_get_pricing_args_instance.to_dict()
# create an instance of RequestPricingsGetPricingArgs from a dict
request_pricings_get_pricing_args_from_dict = RequestPricingsGetPricingArgs.from_dict(request_pricings_get_pricing_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


