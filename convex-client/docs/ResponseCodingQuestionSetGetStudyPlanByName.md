# ResponseCodingQuestionSetGetStudyPlanByName


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_coding_question_set_get_study_plan_by_name import ResponseCodingQuestionSetGetStudyPlanByName

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodingQuestionSetGetStudyPlanByName from a JSON string
response_coding_question_set_get_study_plan_by_name_instance = ResponseCodingQuestionSetGetStudyPlanByName.from_json(json)
# print the JSON string representation of the object
print(ResponseCodingQuestionSetGetStudyPlanByName.to_json())

# convert the object into a dict
response_coding_question_set_get_study_plan_by_name_dict = response_coding_question_set_get_study_plan_by_name_instance.to_dict()
# create an instance of ResponseCodingQuestionSetGetStudyPlanByName from a dict
response_coding_question_set_get_study_plan_by_name_from_dict = ResponseCodingQuestionSetGetStudyPlanByName.from_dict(response_coding_question_set_get_study_plan_by_name_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


