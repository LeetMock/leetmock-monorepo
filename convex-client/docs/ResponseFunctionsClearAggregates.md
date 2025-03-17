# ResponseFunctionsClearAggregates


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_functions_clear_aggregates import ResponseFunctionsClearAggregates

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseFunctionsClearAggregates from a JSON string
response_functions_clear_aggregates_instance = ResponseFunctionsClearAggregates.from_json(json)
# print the JSON string representation of the object
print(ResponseFunctionsClearAggregates.to_json())

# convert the object into a dict
response_functions_clear_aggregates_dict = response_functions_clear_aggregates_instance.to_dict()
# create an instance of ResponseFunctionsClearAggregates from a dict
response_functions_clear_aggregates_from_dict = ResponseFunctionsClearAggregates.from_dict(response_functions_clear_aggregates_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


