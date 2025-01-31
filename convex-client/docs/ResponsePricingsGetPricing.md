# ResponsePricingsGetPricing


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_pricings_get_pricing import ResponsePricingsGetPricing

# TODO update the JSON string below
json = "{}"
# create an instance of ResponsePricingsGetPricing from a JSON string
response_pricings_get_pricing_instance = ResponsePricingsGetPricing.from_json(json)
# print the JSON string representation of the object
print(ResponsePricingsGetPricing.to_json())

# convert the object into a dict
response_pricings_get_pricing_dict = response_pricings_get_pricing_instance.to_dict()
# create an instance of ResponsePricingsGetPricing from a dict
response_pricings_get_pricing_from_dict = ResponsePricingsGetPricing.from_dict(response_pricings_get_pricing_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


