# ResponseEvalTriggerEvalAction


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_eval_trigger_eval_action import ResponseEvalTriggerEvalAction

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseEvalTriggerEvalAction from a JSON string
response_eval_trigger_eval_action_instance = ResponseEvalTriggerEvalAction.from_json(json)
# print the JSON string representation of the object
print(ResponseEvalTriggerEvalAction.to_json())

# convert the object into a dict
response_eval_trigger_eval_action_dict = response_eval_trigger_eval_action_instance.to_dict()
# create an instance of ResponseEvalTriggerEvalAction from a dict
response_eval_trigger_eval_action_from_dict = ResponseEvalTriggerEvalAction.from_dict(response_eval_trigger_eval_action_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


