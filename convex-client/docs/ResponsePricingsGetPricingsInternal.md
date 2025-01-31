# ResponsePricingsGetPricingsInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_pricings_get_pricings_internal import ResponsePricingsGetPricingsInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponsePricingsGetPricingsInternal from a JSON string
response_pricings_get_pricings_internal_instance = ResponsePricingsGetPricingsInternal.from_json(json)
# print the JSON string representation of the object
print(ResponsePricingsGetPricingsInternal.to_json())

# convert the object into a dict
response_pricings_get_pricings_internal_dict = response_pricings_get_pricings_internal_instance.to_dict()
# create an instance of ResponsePricingsGetPricingsInternal from a dict
response_pricings_get_pricings_internal_from_dict = ResponsePricingsGetPricingsInternal.from_dict(response_pricings_get_pricings_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


