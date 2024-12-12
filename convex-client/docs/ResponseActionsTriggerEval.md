# ResponseActionsTriggerEval


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_actions_trigger_eval import ResponseActionsTriggerEval

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsTriggerEval from a JSON string
response_actions_trigger_eval_instance = ResponseActionsTriggerEval.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsTriggerEval.to_json())

# convert the object into a dict
response_actions_trigger_eval_dict = response_actions_trigger_eval_instance.to_dict()
# create an instance of ResponseActionsTriggerEval from a dict
response_actions_trigger_eval_from_dict = ResponseActionsTriggerEval.from_dict(response_actions_trigger_eval_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


