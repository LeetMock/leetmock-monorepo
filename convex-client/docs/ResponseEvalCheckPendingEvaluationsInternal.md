# ResponseEvalCheckPendingEvaluationsInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_eval_check_pending_evaluations_internal import ResponseEvalCheckPendingEvaluationsInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseEvalCheckPendingEvaluationsInternal from a JSON string
response_eval_check_pending_evaluations_internal_instance = ResponseEvalCheckPendingEvaluationsInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseEvalCheckPendingEvaluationsInternal.to_json())

# convert the object into a dict
response_eval_check_pending_evaluations_internal_dict = response_eval_check_pending_evaluations_internal_instance.to_dict()
# create an instance of ResponseEvalCheckPendingEvaluationsInternal from a dict
response_eval_check_pending_evaluations_internal_from_dict = ResponseEvalCheckPendingEvaluationsInternal.from_dict(response_eval_check_pending_evaluations_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


