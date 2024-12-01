# RequestEvalInsertEvaluationArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**overall_feedback** | **str** |  | 
**scoreboards** | [**RequestEvalInsertEvaluationArgsScoreboards**](RequestEvalInsertEvaluationArgsScoreboards.md) |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**total_score** | **float** |  | 

## Example

```python
from convex_client.models.request_eval_insert_evaluation_args import RequestEvalInsertEvaluationArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEvalInsertEvaluationArgs from a JSON string
request_eval_insert_evaluation_args_instance = RequestEvalInsertEvaluationArgs.from_json(json)
# print the JSON string representation of the object
print(RequestEvalInsertEvaluationArgs.to_json())

# convert the object into a dict
request_eval_insert_evaluation_args_dict = request_eval_insert_evaluation_args_instance.to_dict()
# create an instance of RequestEvalInsertEvaluationArgs from a dict
request_eval_insert_evaluation_args_from_dict = RequestEvalInsertEvaluationArgs.from_dict(request_eval_insert_evaluation_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


